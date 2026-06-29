import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { EMBEDDINGS_PROVIDER } from '../ingestion/embeddings.port.js'
import { VECTOR_RETRIEVER } from '../retrieval/vector-retriever.port.js'
import {
  TUTOR_RETRIEVAL_MIN_SCORE,
  TUTOR_RETRIEVAL_TOP_K,
} from './tutor-retrieval.config.js'
import { TUTOR_NO_CONTEXT_REPLY, TUTOR_SYSTEM_PROMPT, buildTutorContext } from './tutor-prompt.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { EmbeddingsProvider } from '../ingestion/embeddings.port.js'
import type { VectorRetriever } from '../retrieval/vector-retriever.port.js'
import type { RetrievedChunk } from '../knowledge-chunk.entity.js'
import type { MessageCitation } from '../../messages/message.entity.js'
import type { ConversationType } from '../../conversations/conversation.entity.js'
import type {
  AssistantReplyChunk,
  ConversationReplyStrategy,
  GenerateReplyInput,
} from '../../assistant/reply-strategy.port.js'

export const TUTOR_REPLY_STRATEGY = Symbol('TUTOR_REPLY_STRATEGY')

// The RAG reply strategy for tutor conversations. Retrieves the user's most relevant
// chunks, and either refuses (when nothing is relevant — no LLM call, so no
// hallucination) or streams a LangChain-composed answer grounded in those chunks,
// emitting the chunks as citations.
//
// Single-turn by design: retrieval and answering use the latest question only, which
// keeps grounding deterministic. Conversation history is intentionally not fed to the
// chain (see PR notes).
@Injectable()
export class TutorReplyStrategy implements ConversationReplyStrategy {
  readonly conversationType: ConversationType = 'tutor'
  private readonly chatModel: ChatOpenAI

  constructor(
    configService: ConfigService<AppEnvironment, true>,
    @Inject(EMBEDDINGS_PROVIDER) private readonly embeddings: EmbeddingsProvider,
    @Inject(VECTOR_RETRIEVER) private readonly retriever: VectorRetriever,
  ) {
    this.chatModel = new ChatOpenAI({
      apiKey: configService.get('OPENAI_API_KEY', { infer: true }),
      model: configService.get('ASSISTANT_MODEL', { infer: true }),
      maxTokens: configService.get('ASSISTANT_MAX_TOKENS', { infer: true }),
    })
  }

  async *generate(input: GenerateReplyInput): AsyncIterable<AssistantReplyChunk> {
    const question = lastUserQuestion(input.history)
    if (question === undefined) {
      yield { type: 'text-delta', text: TUTOR_NO_CONTEXT_REPLY }
      return
    }

    const queryEmbedding = await this.embeddings.embedQuery(question)
    if (input.signal.aborted) {
      return
    }

    const chunks = await this.retriever.retrieveSimilarForUser({
      userId: input.userId,
      queryEmbedding,
      limit: TUTOR_RETRIEVAL_TOP_K,
      minScore: TUTOR_RETRIEVAL_MIN_SCORE,
    })

    // No grounded context: refuse without calling the LLM. The answer cannot
    // hallucinate because no model produced it.
    if (chunks.length === 0) {
      yield { type: 'text-delta', text: TUTOR_NO_CONTEXT_REPLY }
      return
    }

    // Surface the sources before the answer streams so the client can render them
    // immediately; the orchestrator persists them onto the completed reply.
    yield { type: 'citations', citations: chunks.map(toCitation) }

    const chain = ChatPromptTemplate.fromMessages([
      ['system', TUTOR_SYSTEM_PROMPT],
      ['human', 'Context:\n{context}\n\nQuestion: {question}'],
    ])
      .pipe(this.chatModel)
      .pipe(new StringOutputParser())

    const stream = await chain.stream(
      { context: buildTutorContext(chunks), question },
      { signal: input.signal },
    )
    for await (const token of stream) {
      if (input.signal.aborted) {
        return
      }
      if (token.length > 0) {
        yield { type: 'text-delta', text: token }
      }
    }
  }
}

// The question to answer is the most recent user turn. History is oldest-first with the
// just-sent message last; an assistant-only or empty history yields undefined.
function lastUserQuestion(history: GenerateReplyInput['history']): string | undefined {
  for (let index = history.length - 1; index >= 0; index--) {
    const turn = history[index]
    if (turn?.role === 'user' && turn.content.trim().length > 0) {
      return turn.content
    }
  }
  return undefined
}

function toCitation(chunk: RetrievedChunk): MessageCitation {
  return {
    chunkId: chunk.id,
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    text: chunk.text,
    score: chunk.score,
  }
}
