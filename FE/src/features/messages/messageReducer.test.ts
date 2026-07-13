import { describe, expect, it } from 'vitest'
import {
  initialMessagesState,
  mergeThreadMessages,
  messageReducer,
} from './messageReducer.ts'
import type { Message, PendingMessage } from '../../types/domain.ts'

const baseMessage: Message = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'user-alice',
  body: 'Hello',
  createdAt: '2026-01-01T12:00:00.000Z',
}

const pendingMessage: PendingMessage = {
  ...baseMessage,
  id: 'client-1',
  clientMessageId: 'client-1',
}

describe('messageReducer', () => {
  it('adds optimistic message', () => {
    const state = messageReducer(initialMessagesState, {
      type: 'OPTIMISTIC_ADD',
      message: pendingMessage,
    })
    expect(state.pending).toHaveLength(1)
    expect(state.pending[0]?.clientMessageId).toBe('client-1')
  })

  it('confirms optimistic message', () => {
    const withPending = messageReducer(initialMessagesState, {
      type: 'OPTIMISTIC_ADD',
      message: pendingMessage,
    })
    const confirmed = messageReducer(withPending, {
      type: 'OPTIMISTIC_CONFIRM',
      clientMessageId: 'client-1',
      message: { ...baseMessage, id: 'server-1' },
    })
    expect(confirmed.pending).toHaveLength(0)
    expect(confirmed.messages).toHaveLength(1)
    expect(confirmed.messages[0]?.id).toBe('server-1')
  })

  it('rolls back optimistic message', () => {
    const withPending = messageReducer(initialMessagesState, {
      type: 'OPTIMISTIC_ADD',
      message: pendingMessage,
    })
    const rolledBack = messageReducer(withPending, {
      type: 'OPTIMISTIC_ROLLBACK',
      clientMessageId: 'client-1',
    })
    expect(rolledBack.pending).toHaveLength(0)
    expect(rolledBack.messages).toHaveLength(0)
  })

  it('prepends older messages on fetch more', () => {
    const loaded = messageReducer(initialMessagesState, {
      type: 'FETCH_SUCCESS',
      messages: [baseMessage],
      nextCursor: 'cursor-1',
    })
    const olderMessage: Message = {
      ...baseMessage,
      id: 'msg-0',
      body: 'Older',
      createdAt: '2026-01-01T11:00:00.000Z',
    }
    const withMore = messageReducer(loaded, {
      type: 'FETCH_MORE_SUCCESS',
      messages: [olderMessage],
      nextCursor: null,
    })
    expect(withMore.messages).toHaveLength(2)
    expect(withMore.messages[0]?.id).toBe('msg-0')
  })

  it('keeps pending messages when initial fetch succeeds', () => {
    const withPending = messageReducer(initialMessagesState, {
      type: 'OPTIMISTIC_ADD',
      message: pendingMessage,
    })
    const loaded = messageReducer(withPending, {
      type: 'FETCH_SUCCESS',
      messages: [baseMessage],
      nextCursor: null,
    })
    expect(loaded.pending).toHaveLength(1)
    expect(loaded.messages).toHaveLength(1)
  })

  it('orders confirmed messages with equal createdAt by id', () => {
    const sameTime = '2026-01-01T12:00:00.000Z'
    const existing: Message = { ...baseMessage, id: 'msg-b', createdAt: sameTime }
    const loaded = messageReducer(initialMessagesState, {
      type: 'FETCH_SUCCESS',
      messages: [existing],
      nextCursor: null,
    })
    const withPending = messageReducer(loaded, {
      type: 'OPTIMISTIC_ADD',
      message: { ...pendingMessage, id: 'client-x', clientMessageId: 'client-x' },
    })
    const confirmed = messageReducer(withPending, {
      type: 'OPTIMISTIC_CONFIRM',
      clientMessageId: 'client-x',
      message: { ...baseMessage, id: 'msg-a', createdAt: sameTime },
    })

    expect(confirmed.messages.map((message) => message.id)).toEqual(['msg-a', 'msg-b'])
  })
})

describe('mergeThreadMessages', () => {
  it('orders messages with equal createdAt by id', () => {
    const sameTime = '2026-01-01T12:00:00.000Z'
    const messageB: Message = { ...baseMessage, id: 'msg-b', createdAt: sameTime }
    const messageA: Message = { ...baseMessage, id: 'msg-a', createdAt: sameTime }

    const merged = mergeThreadMessages([messageB, messageA], [], null)

    expect(merged.map((message) => message.id)).toEqual(['msg-a', 'msg-b'])
  })

  it('includes the in-flight streaming message in order', () => {
    const streaming = {
      id: 'assistant-temp',
      conversationId: 'conv-1',
      senderId: 'assistant',
      body: 'thinking',
      createdAt: '2026-01-01T13:00:00.000Z',
      status: 'streaming' as const,
    }

    const merged = mergeThreadMessages([baseMessage], [], streaming)

    expect(merged.map((message) => message.id)).toEqual(['msg-1', 'assistant-temp'])
  })
})

describe('messageReducer streaming', () => {
  it('starts, appends tokens, records tools, and finalizes a streamed reply', () => {
    const started = messageReducer(initialMessagesState, {
      type: 'STREAM_START',
      placeholderMessageId: 'assistant-temp',
      conversationId: 'conv-1',
      createdAt: '2026-01-01T13:00:00.000Z',
    })
    expect(started.streaming?.status).toBe('streaming')

    const withTool = messageReducer(started, { type: 'STREAM_TOOL', name: 'list_my_conversations' })
    const withToken = messageReducer(
      messageReducer(withTool, { type: 'STREAM_TOKEN', text: 'Hi ' }),
      { type: 'STREAM_TOKEN', text: 'there' },
    )
    expect(withToken.streaming?.body).toBe('Hi there')
    expect(withToken.streaming?.annotations?.tools).toEqual(['list_my_conversations'])

    const done = messageReducer(withToken, {
      type: 'STREAM_DONE',
      message: { ...baseMessage, id: 'assistant-1', senderId: 'assistant', body: 'Hi there' },
    })
    expect(done.streaming).toBeNull()
    expect(done.messages.map((message) => message.id)).toContain('assistant-1')
  })

  it('records tool completion separately from announced tools', () => {
    const started = messageReducer(initialMessagesState, {
      type: 'STREAM_START',
      placeholderMessageId: 'assistant-temp',
      conversationId: 'conv-1',
      createdAt: '2026-01-01T13:00:00.000Z',
    })
    const announced = messageReducer(started, {
      type: 'STREAM_TOOL',
      name: 'retrieve_knowledge',
    })
    const completed = messageReducer(announced, {
      type: 'STREAM_TOOL_RESULT',
      name: 'retrieve_knowledge',
    })

    expect(completed.streaming?.annotations?.tools).toEqual(['retrieve_knowledge'])
    expect(completed.streaming?.annotations?.completedTools).toEqual(['retrieve_knowledge'])
  })

  it('clears the streaming message on error', () => {
    const started = messageReducer(initialMessagesState, {
      type: 'STREAM_START',
      placeholderMessageId: 'assistant-temp',
      conversationId: 'conv-1',
      createdAt: '2026-01-01T13:00:00.000Z',
    })
    const errored = messageReducer(started, { type: 'STREAM_ERROR' })
    expect(errored.streaming).toBeNull()
  })
})
