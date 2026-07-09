import { describe, expect, it } from 'vitest'
import { ChatOpenAI } from '@langchain/openai'
import { MemorySaver } from '@langchain/langgraph'
import {
  ASSISTANT_SYSTEM_PROMPT,
  ASSISTANT_SYSTEM_PROMPT_VERSION,
} from '../assistant/prompts/assistant-system-prompt.js'
import { ListMyConversationsTool } from '../assistant/tools/list-my-conversations.tool.js'
import { AssistantToolRegistry } from '../assistant/tools/assistant-tool.registry.js'
import { buildAgentGraph } from '../agent/agent.graph.js'
import { LangGraphAgentStrategy } from '../agent/langgraph-agent.strategy.js'
import type { ConversationsService } from '../conversations/conversations.service.js'
import type { ConversationRecord } from '../conversations/conversation.entity.js'
import type { EmbeddingsProvider } from '../knowledge/ingestion/embeddings.port.js'
import type { VectorRetriever } from '../knowledge/retrieval/vector-retriever.port.js'
import type { AssistantReplyChunk } from '../assistant/reply-strategy.port.js'

// ---- Tier 1: deterministic checks (always run in CI; no network) ----

describe('assistant prompt (deterministic)', () => {
  it('declares a version so prompt changes are reviewable', () => {
    expect(ASSISTANT_SYSTEM_PROMPT_VERSION).toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('encodes the load-bearing constraints (scope + no fabrication + tool guidance)', () => {
    const prompt = ASSISTANT_SYSTEM_PROMPT.toLowerCase()
    expect(prompt).toContain('list_my_conversations')
    expect(prompt).toContain('another user')
    expect(prompt).toContain('fabricate')
  })

  it("exposes the tool with no user-id parameter (scoping can't come from the model)", () => {
    const tool = new ListMyConversationsTool({} as ConversationsService)
    const properties = (tool.definition.parameters as { properties?: Record<string, unknown> })
      .properties

    expect(tool.definition.name).toBe('list_my_conversations')
    expect(Object.keys(properties ?? {})).not.toContain('userId')
    expect(tool.definition.parameters).toMatchObject({ additionalProperties: false })
  })
})

// ---- Tier 2: real-API behavior (opt-in via RUN_LLM_EVALS=1; spends tokens) ----

const runLlmEvals = process.env.RUN_LLM_EVALS === '1'

// The assistant path of the shared agent graph, over an in-memory checkpoint saver so the
// eval needs no MongoDB. Embeddings/retriever are never reached (assistant has no
// retrieval tool), so no-op fakes suffice.
function buildRealAssistantStrategy(): LangGraphAgentStrategy {
  const chatModel = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.ASSISTANT_MODEL || 'gpt-4o-mini',
    maxTokens: 512,
  })

  const conversation: ConversationRecord = {
    id: 'conv-eval',
    type: 'direct',
    title: 'Planning with Dana',
    participantIds: ['user-eval', 'user-dana'],
    lastActivityAt: '2026-06-01T00:00:00.000Z',
    lastMessage: { body: 'see you tomorrow', senderId: 'user-dana', createdAt: '2026-06-01T00:00:00.000Z' },
    createdAt: '2026-05-01T00:00:00.000Z',
  }
  const conversationsService = {
    listForParticipant: () => Promise.resolve([conversation]),
  } as unknown as ConversationsService

  const registry = new AssistantToolRegistry([new ListMyConversationsTool(conversationsService)])
  const noopEmbeddings: EmbeddingsProvider = {
    embedDocuments: () => Promise.resolve([]),
    embedQuery: () => Promise.resolve([]),
  }
  const noopRetriever: VectorRetriever = { retrieveSimilarForUser: () => Promise.resolve([]) }

  const graph = buildAgentGraph({
    chatModel,
    embeddings: noopEmbeddings,
    retriever: noopRetriever,
    toolRegistry: registry,
    checkpointer: new MemorySaver(),
  })

  return new LangGraphAgentStrategy(
    'assistant',
    graph,
    ASSISTANT_SYSTEM_PROMPT,
    registry.definitions(),
    false,
  )
}

async function collect(chunks: AsyncIterable<AssistantReplyChunk>): Promise<AssistantReplyChunk[]> {
  const collected: AssistantReplyChunk[] = []
  for await (const chunk of chunks) {
    collected.push(chunk)
  }
  return collected
}

describe.skipIf(!runLlmEvals)('assistant agent (real OpenAI)', () => {
  it('calls list_my_conversations when asked about the user\'s chats', async () => {
    const strategy = buildRealAssistantStrategy()
    const chunks = await collect(
      strategy.generate({
        userId: 'user-eval',
        conversationId: 'conv-eval',
        history: [{ role: 'user', content: 'What conversations do I have?' }],
        signal: new AbortController().signal,
      }),
    )

    expect(
      chunks.some((chunk) => chunk.type === 'tool-invoked' && chunk.name === 'list_my_conversations'),
    ).toBe(true)
  }, 30_000)

  it('answers a general question directly with text', async () => {
    const strategy = buildRealAssistantStrategy()
    const chunks = await collect(
      strategy.generate({
        userId: 'user-eval',
        conversationId: 'conv-eval-2',
        history: [{ role: 'user', content: 'In one word, what color is the sky on a clear day?' }],
        signal: new AbortController().signal,
      }),
    )

    const text = chunks
      .filter((chunk): chunk is { type: 'text-delta'; text: string } => chunk.type === 'text-delta')
      .map((chunk) => chunk.text)
      .join('')
    expect(text.trim().length).toBeGreaterThan(0)
  }, 30_000)
})
