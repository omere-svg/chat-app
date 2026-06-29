import { describe, expect, it, vi } from 'vitest'
import type { ConfigService } from '@nestjs/config'
import { TutorReplyStrategy } from '../knowledge/tutor/tutor-reply.strategy.js'
import { TUTOR_NO_CONTEXT_REPLY } from '../knowledge/tutor/tutor-prompt.js'
import {
  TUTOR_RETRIEVAL_MIN_SCORE,
  TUTOR_RETRIEVAL_TOP_K,
} from '../knowledge/tutor/tutor-retrieval.config.js'
import type { AppEnvironment } from '../config/environment.types.js'
import type { VectorRetriever } from '../knowledge/retrieval/vector-retriever.port.js'
import type {
  AssistantReplyChunk,
  GenerateReplyInput,
} from '../assistant/reply-strategy.port.js'

const fakeConfig = {
  get: (key: keyof AppEnvironment): unknown => {
    const values: Partial<Record<keyof AppEnvironment, unknown>> = {
      OPENAI_API_KEY: 'test-key',
      ASSISTANT_MODEL: 'gpt-4o-mini',
      ASSISTANT_MAX_TOKENS: 1024,
    }
    return values[key]
  },
} as unknown as ConfigService<AppEnvironment, true>

function inputWith(history: GenerateReplyInput['history']): GenerateReplyInput {
  return {
    userId: 'user-1',
    conversationId: 'conv-tutor',
    history,
    signal: new AbortController().signal,
  }
}

async function collect(iterable: AsyncIterable<AssistantReplyChunk>): Promise<AssistantReplyChunk[]> {
  const chunks: AssistantReplyChunk[] = []
  for await (const chunk of iterable) {
    chunks.push(chunk)
  }
  return chunks
}

describe('TutorReplyStrategy grounding gate', () => {
  it('refuses without calling the LLM when retrieval returns nothing relevant', async () => {
    const embedQuery = vi.fn().mockResolvedValue([0.1, 0.2])
    const retrieveSimilarForUser = vi.fn<VectorRetriever['retrieveSimilarForUser']>().mockResolvedValue([])
    const strategy = new TutorReplyStrategy(
      fakeConfig,
      { embedQuery, embedDocuments: vi.fn() },
      { retrieveSimilarForUser },
    )

    const chunks = await collect(strategy.generate(inputWith([{ role: 'user', content: 'what is X?' }])))

    expect(chunks).toEqual([{ type: 'text-delta', text: TUTOR_NO_CONTEXT_REPLY }])
    expect(chunks.some((chunk) => chunk.type === 'citations')).toBe(false)
    // It scoped retrieval to the user with the configured top-K and threshold.
    expect(retrieveSimilarForUser).toHaveBeenCalledWith({
      userId: 'user-1',
      queryEmbedding: [0.1, 0.2],
      limit: TUTOR_RETRIEVAL_TOP_K,
      minScore: TUTOR_RETRIEVAL_MIN_SCORE,
    })
  })

  it('refuses without embedding or retrieving when there is no user question', async () => {
    const embedQuery = vi.fn()
    const retrieveSimilarForUser = vi.fn<VectorRetriever['retrieveSimilarForUser']>()
    const strategy = new TutorReplyStrategy(
      fakeConfig,
      { embedQuery, embedDocuments: vi.fn() },
      { retrieveSimilarForUser },
    )

    const chunks = await collect(strategy.generate(inputWith([])))

    expect(chunks).toEqual([{ type: 'text-delta', text: TUTOR_NO_CONTEXT_REPLY }])
    expect(embedQuery).not.toHaveBeenCalled()
    expect(retrieveSimilarForUser).not.toHaveBeenCalled()
  })
})
