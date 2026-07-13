import { describe, expect, it, vi } from 'vitest'
import { StreamAssistantReplyOrchestrator } from '../chat/use-cases/stream-assistant-reply.orchestrator.js'
import type { AssistantStreamEvent } from '../chat/assistant-stream-event.js'
import type {
  AgentReplyChunk,
  ConversationReplyStrategy,
} from '../agent/reply-strategy.port.js'
import type { ReplyStrategyRegistry } from '../agent/reply-strategy.registry.js'
import type { ConversationRecord } from '../conversations/conversation.entity.js'
import type { ConversationsService } from '../conversations/conversations.service.js'
import type { MessageRecord } from '../messages/message.entity.js'
import type { MessagesService } from '../messages/messages.service.js'
import type { SendMessageDto } from '../messages/dto/send-message.dto.js'

const conversation: ConversationRecord = {
  id: 'conv-assistant',
  type: 'assistant',
  title: 'AI Assistant',
  participantIds: ['user-1'],
  lastActivityAt: '2026-01-01T00:00:00.000Z',
  lastMessage: null,
  createdAt: '2026-01-01T00:00:00.000Z',
}

const userMessage: MessageRecord = {
  id: 'msg-user-1',
  conversationId: conversation.id,
  senderId: 'user-1',
  body: 'hello',
  createdAt: '2026-01-01T00:00:01.000Z',
}

const assistantReply: MessageRecord = {
  id: 'msg-assistant-1',
  conversationId: conversation.id,
  senderId: 'assistant',
  body: 'Hi there',
  createdAt: '2026-01-01T00:00:02.000Z',
  metadata: { replyToMessageId: userMessage.id },
}

function strategyYielding(chunks: AgentReplyChunk[]): {
  strategy: ConversationReplyStrategy
  generate: ReturnType<typeof vi.fn>
} {
  const generate = vi.fn(async function* (): AsyncIterable<AgentReplyChunk> {
    await Promise.resolve()
    for (const chunk of chunks) {
      yield chunk
    }
  })
  return { strategy: { conversationType: 'assistant', generate }, generate }
}

function buildOrchestrator(options: {
  strategy: ConversationReplyStrategy
  existingReply?: MessageRecord | null
}): {
  orchestrator: StreamAssistantReplyOrchestrator
  createMessage: ReturnType<typeof vi.fn>
  createAssistantReply: ReturnType<typeof vi.fn>
  advanceLastMessageIfNewer: ReturnType<typeof vi.fn>
  setTitleIfStillDefault: ReturnType<typeof vi.fn>
} {
  const createMessage = vi.fn().mockResolvedValue(userMessage)
  const findAssistantReplyTo = vi.fn().mockResolvedValue(options.existingReply ?? null)
  const listRecentMessagesOldestFirst = vi.fn().mockResolvedValue([userMessage])
  const createAssistantReply = vi.fn().mockResolvedValue(assistantReply)
  const advanceLastMessageIfNewer = vi.fn().mockResolvedValue(undefined)
  const setTitleIfStillDefault = vi.fn().mockResolvedValue(undefined)

  const messagesService = {
    createMessage,
    findAssistantReplyTo,
    listRecentMessagesOldestFirst,
    createAssistantReply,
  } as unknown as MessagesService
  const conversationsService = {
    advanceLastMessageIfNewer,
    setTitleIfStillDefault,
  } as unknown as ConversationsService
  const registry = { resolve: vi.fn().mockReturnValue(options.strategy) } as unknown as ReplyStrategyRegistry

  return {
    orchestrator: new StreamAssistantReplyOrchestrator(
      messagesService,
      conversationsService,
      registry,
    ),
    createMessage,
    createAssistantReply,
    advanceLastMessageIfNewer,
    setTitleIfStillDefault,
  }
}

function collector(): { emit: (event: AssistantStreamEvent) => void; events: AssistantStreamEvent[] } {
  const events: AssistantStreamEvent[] = []
  return { emit: (event) => events.push(event), events }
}

const sendMessageDto = { body: 'hello' } as SendMessageDto

describe('StreamAssistantReplyOrchestrator', () => {
  it('streams user_message -> tokens -> tool -> done and persists the reply linked to the user message', async () => {
    const { strategy, generate } = strategyYielding([
      { type: 'tool-invoked', name: 'list_my_conversations' },
      { type: 'text-delta', text: 'Hi ' },
      { type: 'text-delta', text: 'there' },
    ])
    const { orchestrator, createAssistantReply, advanceLastMessageIfNewer, setTitleIfStillDefault } =
      buildOrchestrator({ strategy })
    const { emit, events } = collector()

    await orchestrator.stream({
      userId: 'user-1',
      conversation,
      sendMessageDto,
      signal: new AbortController().signal,
      emit,
    })

    // The chat is named from the first user message.
    expect(setTitleIfStillDefault).toHaveBeenCalledWith(conversation.id, userMessage.body)
    expect(generate).toHaveBeenCalledOnce()
    expect(generate.mock.calls[0]?.[0]).toMatchObject({
      userId: 'user-1',
      conversationId: conversation.id,
    })
    expect(events.map((event) => event.event)).toEqual([
      'user_message',
      'tool',
      'token',
      'token',
      'done',
    ])
    expect(createAssistantReply).toHaveBeenCalledWith({
      conversationId: conversation.id,
      body: 'Hi there',
      replyToMessageId: userMessage.id,
    })
    // Advanced twice: once for the persisted user message, once for the assistant reply.
    expect(advanceLastMessageIfNewer).toHaveBeenCalledTimes(2)
    const doneEvent = events.at(-1)
    expect(doneEvent).toEqual({ event: 'done', data: { message: assistantReply } })
  })

  it('replays an existing reply without invoking the LLM (idempotent retry)', async () => {
    const { strategy, generate } = strategyYielding([{ type: 'text-delta', text: 'should not run' }])
    const { orchestrator, createAssistantReply } = buildOrchestrator({
      strategy,
      existingReply: assistantReply,
    })
    const { emit, events } = collector()

    await orchestrator.stream({
      userId: 'user-1',
      conversation,
      sendMessageDto,
      signal: new AbortController().signal,
      emit,
    })

    expect(generate).not.toHaveBeenCalled()
    expect(createAssistantReply).not.toHaveBeenCalled()
    expect(events.map((event) => event.event)).toEqual(['user_message', 'done'])
    expect(events.at(-1)).toEqual({ event: 'done', data: { message: assistantReply } })
  })

  it('persists nothing when the client disconnects mid-stream', async () => {
    const { strategy } = strategyYielding([])
    const { orchestrator, createAssistantReply } = buildOrchestrator({ strategy })
    const { emit, events } = collector()

    const abortController = new AbortController()
    abortController.abort()

    await orchestrator.stream({
      userId: 'user-1',
      conversation,
      sendMessageDto,
      signal: abortController.signal,
      emit,
    })

    expect(createAssistantReply).not.toHaveBeenCalled()
    expect(events.map((event) => event.event)).toEqual(['user_message'])
  })

  it('emits an error and persists nothing when generation fails', async () => {
    const generate = vi.fn(async function* (): AsyncIterable<AgentReplyChunk> {
      await Promise.resolve()
      yield { type: 'text-delta', text: 'partial' }
      throw new Error('openai exploded')
    })
    const strategy: ConversationReplyStrategy = { conversationType: 'assistant', generate }
    const { orchestrator, createAssistantReply } = buildOrchestrator({ strategy })
    const { emit, events } = collector()

    await orchestrator.stream({
      userId: 'user-1',
      conversation,
      sendMessageDto,
      signal: new AbortController().signal,
      emit,
    })

    expect(createAssistantReply).not.toHaveBeenCalled()
    const lastEvent = events.at(-1)
    expect(lastEvent?.event).toBe('error')
    expect(lastEvent).toMatchObject({ data: { code: 'ASSISTANT_UNAVAILABLE' } })
  })

  it('emits a citations event and persists citations on a grounded tutor reply', async () => {
    const citations = [
      {
        chunkId: 'kchunk-1',
        documentId: 'kdoc-1',
        documentName: 'notes.md',
        text: 'the answer',
        score: 0.91,
      },
    ]
    const { strategy } = strategyYielding([
      { type: 'citations', citations },
      { type: 'text-delta', text: 'Grounded ' },
      { type: 'text-delta', text: 'answer' },
    ])
    const { orchestrator, createAssistantReply } = buildOrchestrator({ strategy })
    const { emit, events } = collector()

    await orchestrator.stream({
      userId: 'user-1',
      conversation: { ...conversation, type: 'tutor' },
      sendMessageDto,
      signal: new AbortController().signal,
      emit,
    })

    // Sources arrive before the answer text, then done.
    expect(events.map((event) => event.event)).toEqual([
      'user_message',
      'citations',
      'token',
      'token',
      'done',
    ])
    const citationsEvent = events.find((event) => event.event === 'citations')
    expect(citationsEvent).toEqual({ event: 'citations', data: { citations } })
    expect(createAssistantReply).toHaveBeenCalledWith({
      conversationId: conversation.id,
      body: 'Grounded answer',
      replyToMessageId: userMessage.id,
      citations,
    })
  })

  it('emits an error when the assistant produces an empty reply', async () => {
    const { strategy } = strategyYielding([{ type: 'text-delta', text: '   ' }])
    const { orchestrator, createAssistantReply } = buildOrchestrator({ strategy })
    const { emit, events } = collector()

    await orchestrator.stream({
      userId: 'user-1',
      conversation,
      sendMessageDto,
      signal: new AbortController().signal,
      emit,
    })

    expect(createAssistantReply).not.toHaveBeenCalled()
    expect(events.at(-1)?.event).toBe('error')
  })
})
