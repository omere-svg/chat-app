import { describe, expect, it } from 'vitest'
import { initialMessagesState, messageReducer } from './messageReducer.ts'
import type { MessagesState } from './messageReducer.ts'
import type { Citation, Message } from '@/types/domain.ts'

const citations: Citation[] = [
  {
    chunkId: 'k1',
    documentId: 'd1',
    documentName: 'notes.md',
    text: 'Venus is the hottest planet.',
    score: 0.91,
  },
]

function streamingState(): MessagesState {
  return messageReducer(
    { ...initialMessagesState, status: 'success' },
    {
      type: 'STREAM_START',
      placeholderMessageId: 'assistant-1',
      conversationId: 'conv-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  )
}

describe('messageReducer citations', () => {
  it('stores streamed citations on the streaming message annotations', () => {
    const state = messageReducer(streamingState(), { type: 'STREAM_CITATIONS', citations })
    expect(state.streaming?.annotations?.citations).toEqual(citations)
  })

  it('ignores STREAM_CITATIONS when nothing is streaming', () => {
    const state = messageReducer(
      { ...initialMessagesState, status: 'success' },
      { type: 'STREAM_CITATIONS', citations },
    )
    expect(state.streaming).toBeNull()
  })

  it('keeps citations on the persisted message after STREAM_DONE', () => {
    let state = streamingState()
    state = messageReducer(state, { type: 'STREAM_CITATIONS', citations })
    state = messageReducer(state, { type: 'STREAM_TOKEN', text: 'Venus.' })

    const persisted: Message = {
      id: 'msg-a',
      conversationId: 'conv-1',
      senderId: 'assistant',
      body: 'Venus.',
      createdAt: '2026-01-01T00:00:02.000Z',
      metadata: { replyToMessageId: 'msg-u', citations },
    }
    state = messageReducer(state, { type: 'STREAM_DONE', message: persisted })

    expect(state.streaming).toBeNull()
    const stored = state.messages.find((message) => message.id === 'msg-a')
    expect(stored?.metadata?.citations).toEqual(citations)
  })
})
