import { describe, expect, it } from 'vitest'
import {
  initialMessagesState,
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
})
