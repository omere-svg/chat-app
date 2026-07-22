// Retrieval + answer-quality eval for the AI tutor. Standalone (not part of the
// hermetic vitest suite) because it needs a live Atlas cluster and OpenAI. Run after
// provisioning the vector index:
//
//   MONGO_URI="mongodb+srv://..." OPENAI_API_KEY="sk-..." npm run eval
//
// It ingests the committed fixtures under a dedicated eval user, measures recall@k of
// the expected source document, and prints each generated answer plus a keyword-
// coverage proxy for answer quality. Paste the summary into the PR description.
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import mongoose from 'mongoose'
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { PipelineStage } from 'mongoose'
import { TextChunker } from '../src/modules/knowledge-rag/ingestion/text-chunker.js'
import { buildUserScopedVectorSearchPipeline } from '../src/modules/knowledge-chunk/atlas-vector-search.query.js'
import {
  DEFAULT_ATLAS_VECTOR_INDEX,
  KNOWLEDGE_CHUNKS_COLLECTION,
} from '../src/modules/knowledge-rag/atlas/vector-index.config.js'
import { TUTOR_RETRIEVAL_TOP_K } from '../src/modules/knowledge-rag/tutor/tutor-retrieval.config.js'
import { TUTOR_SYSTEM_PROMPT, buildTutorContext } from '../src/modules/knowledge-rag/tutor/tutor-prompt.js'

const EVAL_USER_ID = 'eval-user'
const INDEX_READY_TIMEOUT_MS = 90_000
const INDEX_POLL_INTERVAL_MS = 3_000

interface EvalQuestion {
  id: string
  question: string
  expectedDocument: string
  expectedKeywords: string[]
}

interface SearchHit {
  documentName: string
  text: string
  score: number
}

// String _id (the app's convention) — the driver's default Document types _id as
// ObjectId, so the collection is typed explicitly here.
interface EvalChunkDoc {
  _id: string
  userId: string
  documentId: string
  documentName: string
  chunkIndex: number
  text: string
  embedding: number[]
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} is required`)
  }
  return value
}

function loadDataset(scriptDir: string): EvalQuestion[] {
  const parsed: unknown = JSON.parse(readFileSync(join(scriptDir, 'dataset.json'), 'utf8'))
  if (typeof parsed !== 'object' || parsed === null || !('questions' in parsed)) {
    throw new Error('dataset.json must contain a "questions" array')
  }
  const questions = (parsed as { questions: unknown }).questions
  if (!Array.isArray(questions)) {
    throw new Error('dataset.json "questions" must be an array')
  }
  return questions.map((entry): EvalQuestion => {
    const item = entry as Record<string, unknown>
    return {
      id: String(item.id),
      question: String(item.question),
      expectedDocument: String(item.expectedDocument),
      expectedKeywords: Array.isArray(item.expectedKeywords)
        ? item.expectedKeywords.map((keyword) => String(keyword))
        : [],
    }
  })
}

async function ingestFixtures(
  fixturesDir: string,
  embeddings: OpenAIEmbeddings,
  chunker: TextChunker,
): Promise<number> {
  const collection = mongoose.connection.db?.collection<EvalChunkDoc>(KNOWLEDGE_CHUNKS_COLLECTION)
  if (collection === undefined) {
    throw new Error('Database connection is not established')
  }
  // Start from a clean slate for the eval user so reruns are deterministic.
  await collection.deleteMany({ userId: EVAL_USER_ID })

  let total = 0
  for (const filename of readdirSync(fixturesDir)) {
    const text = readFileSync(join(fixturesDir, filename), 'utf8')
    const chunks = await chunker.chunk(text)
    const vectors = await embeddings.embedDocuments(chunks)
    await collection.insertMany(
      chunks.map((chunkText, chunkIndex) => ({
        _id: `eval-${filename}-${chunkIndex}`,
        userId: EVAL_USER_ID,
        documentId: `eval-${filename}`,
        documentName: filename,
        chunkIndex,
        text: chunkText,
        embedding: vectors[chunkIndex] ?? [],
      })),
    )
    total += chunks.length
    console.log(`  ingested ${chunks.length} chunks from ${filename}`)
  }
  return total
}

async function retrieve(
  indexName: string,
  embeddings: OpenAIEmbeddings,
  question: string,
): Promise<SearchHit[]> {
  const collection = mongoose.connection.db?.collection(KNOWLEDGE_CHUNKS_COLLECTION)
  if (collection === undefined) {
    throw new Error('Database connection is not established')
  }
  const queryEmbedding = await embeddings.embedQuery(question)
  const pipeline = buildUserScopedVectorSearchPipeline({
    indexName,
    userId: EVAL_USER_ID,
    queryEmbedding,
    limit: TUTOR_RETRIEVAL_TOP_K,
    numCandidates: TUTOR_RETRIEVAL_TOP_K * 10,
  })
  return collection.aggregate<SearchHit>(pipeline as unknown as PipelineStage[]).toArray()
}

async function waitForIndex(indexName: string, embeddings: OpenAIEmbeddings): Promise<void> {
  const deadline = Date.now() + INDEX_READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    const hits = await retrieve(indexName, embeddings, 'planet')
    if (hits.length > 0) {
      return
    }
    console.log('  waiting for Atlas to index the new chunks...')
    await new Promise((resolve) => setTimeout(resolve, INDEX_POLL_INTERVAL_MS))
  }
  throw new Error(
    `Vector index "${indexName}" returned no results within ${INDEX_READY_TIMEOUT_MS}ms. ` +
      'Did you run "npm run provision:vector-index" and is the index READY?',
  )
}

function coverage(answer: string, keywords: string[]): number {
  if (keywords.length === 0) {
    return 1
  }
  const lower = answer.toLowerCase()
  const matched = keywords.filter((keyword) => lower.includes(keyword.toLowerCase())).length
  return matched / keywords.length
}

async function main(): Promise<void> {
  const uri = requireEnv('MONGO_URI')
  const apiKey = requireEnv('OPENAI_API_KEY')
  const indexName = process.env.ATLAS_VECTOR_INDEX ?? DEFAULT_ATLAS_VECTOR_INDEX
  const scriptDir = dirname(fileURLToPath(import.meta.url))

  const embeddings = new OpenAIEmbeddings({
    apiKey,
    model: process.env.EMBEDDINGS_MODEL ?? 'text-embedding-3-small',
  })
  const answerChain = ChatPromptTemplate.fromMessages([
    ['system', TUTOR_SYSTEM_PROMPT],
    ['human', 'Context:\n{context}\n\nQuestion: {question}'],
  ])
    .pipe(new ChatOpenAI({ apiKey, model: process.env.ASSISTANT_MODEL ?? 'gpt-4o-mini' }))
    .pipe(new StringOutputParser())

  const dataset = loadDataset(scriptDir)
  await mongoose.connect(uri)
  try {
    console.log('Ingesting fixtures...')
    const totalChunks = await ingestFixtures(join(scriptDir, 'fixtures'), embeddings, new TextChunker())
    await waitForIndex(indexName, embeddings)

    let retrievalHits = 0
    let coverageSum = 0
    console.log(`\nEvaluating ${dataset.length} questions (recall@${TUTOR_RETRIEVAL_TOP_K})\n`)

    for (const item of dataset) {
      const hits = await retrieve(indexName, embeddings, item.question)
      const retrieved = hits.some((hit) => hit.documentName === item.expectedDocument)
      if (retrieved) {
        retrievalHits++
      }
      const answer = await answerChain.invoke({
        context: buildTutorContext(hits),
        question: item.question,
      })
      const answerCoverage = coverage(answer, item.expectedKeywords)
      coverageSum += answerCoverage

      console.log(`[${item.id}] ${item.question}`)
      console.log(`  retrieved expected doc: ${retrieved ? 'YES' : 'NO'} (top score ${hits[0]?.score?.toFixed(3) ?? 'n/a'})`)
      console.log(`  answer coverage: ${(answerCoverage * 100).toFixed(0)}%`)
      console.log(`  answer: ${answer.replace(/\s+/g, ' ').slice(0, 200)}\n`)
    }

    console.log('================ SUMMARY ================')
    console.log(`Documents ingested: ${totalChunks} chunks`)
    console.log(
      `Retrieval recall@${TUTOR_RETRIEVAL_TOP_K}: ${retrievalHits}/${dataset.length} ` +
        `(${((retrievalHits / dataset.length) * 100).toFixed(1)}%)`,
    )
    console.log(
      `Mean answer keyword coverage: ${((coverageSum / dataset.length) * 100).toFixed(1)}%`,
    )
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error: unknown) => {
  console.error('Eval failed:', error)
  process.exitCode = 1
})
