import { describe, expect, it } from 'vitest'
import {
  ASSISTANT_SYSTEM_PROMPT,
  ASSISTANT_SYSTEM_PROMPT_VERSION,
} from '../assistant/prompts/assistant-system-prompt.js'
import { ListMyConversationsTool } from '../assistant/tools/list-my-conversations.tool.js'
import { AssistantToolRegistry } from '../assistant/tools/assistant-tool.registry.js'
import { OpenAiAssistantStrategy } from '../assistant/openai-assistant.strategy.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../config/environment.types.js'
import type { ConversationsService } from '../conversations/conversations.service.js'
import type { ConversationRecord } from '../conversations/conversation.entity.js'
import type { AssistantReplyChunk } from '../assistant/reply-strategy.port.js'

// ---- Tier 1: deterministic checks (always run in CI; no network) ----

describe('assistant prompt (deterministic)', () => {
  it('declares a version so prompt changes are reviewable', () => {
    expect(ASSISTANT_SYSTEM_PROMPT_VERSION).toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('encodes the load-bearing constraints (scope + no fabrication + tool guidance)', () => {
    const prompt = ASSISTANT_SYSTEM_PROMPT.toLowerCase()
    expect(prompt).toContain('list_my_conversations')
    expect(prompt).toContain("another user")
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

function buildRealStrategy(): OpenAiAssistantStrategy {
  const configService = {
    get: (key: keyof AppEnvironment) => {
      if (key === 'ASSISTANT_MODEL') {
        // `||` (not `??`) so an empty/unset env var falls back to the default.
        return process.env.ASSISTANT_MODEL || 'gpt-4o-mini'
      }
      if (key === 'ASSISTANT_MAX_TOKENS') {
        return 512
      }
      return process.env[key]
    },
  } as unknown as ConfigService<AppEnvironment, true>

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
  return new OpenAiAssistantStrategy(configService, registry)
}

async function collect(chunks: AsyncIterable<AssistantReplyChunk>): Promise<AssistantReplyChunk[]> {
  const collected: AssistantReplyChunk[] = []
  for await (const chunk of chunks) {
    collected.push(chunk)
  }
  return collected
}

describe.skipIf(!runLlmEvals)('assistant prompt (real OpenAI)', () => {
  it('calls list_my_conversations when asked about the user\'s chats', async () => {
    const strategy = buildRealStrategy()
    const chunks = await collect(
      strategy.generate({
        userId: 'user-eval',
        conversationId: 'conv-eval',
        history: [{ role: 'user', content: 'What conversations do I have?' }],
        signal: new AbortController().signal,
      }),
    )

    expect(chunks.some((chunk) => chunk.type === 'tool-invoked' && chunk.name === 'list_my_conversations')).toBe(true)
  }, 30_000)

  it('answers a general question directly with text', async () => {
    const strategy = buildRealStrategy()
    const chunks = await collect(
      strategy.generate({
        userId: 'user-eval',
        conversationId: 'conv-eval',
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
