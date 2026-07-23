import type {
  Citation,
  Message,
  PendingMessage,
  StreamingMessage,
} from '@/types/domain.ts'

export type MessagesState = {
  status: 'idle' | 'loading' | 'loading-more' | 'success' | 'error'
  messages: Message[]
  pending: PendingMessage[]
  streaming: StreamingMessage | null
  nextCursor: string | null
  error: string | null
  loadMoreError: string | null
}

export type MessagesAction =
  | { type: 'RESET' }
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS'
      messages: Message[]
      nextCursor: string | null
    }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'FETCH_MORE_START' }
  | {
      type: 'FETCH_MORE_SUCCESS'
      messages: Message[]
      nextCursor: string | null
    }
  | { type: 'FETCH_MORE_ERROR'; error: string }
  | { type: 'OPTIMISTIC_ADD'; message: PendingMessage }
  | { type: 'OPTIMISTIC_CONFIRM'; clientMessageId: string; message: Message }
  | { type: 'OPTIMISTIC_ROLLBACK'; clientMessageId: string }
  | {
      type: 'STREAM_START'
      placeholderMessageId: string
      conversationId: string
      createdAt: string
    }
  | { type: 'STREAM_TOKEN'; text: string }
  | { type: 'STREAM_TOOL'; name: string }
  | { type: 'STREAM_TOOL_RESULT'; name: string }
  | { type: 'STREAM_CITATIONS'; citations: Citation[] }
  | { type: 'STREAM_DONE'; message: Message }
  | { type: 'STREAM_ERROR' }
