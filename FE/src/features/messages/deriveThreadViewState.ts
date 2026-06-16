import type { Message, PendingMessage } from '../../types/domain.ts'
import type { MessagesState } from './messageReducer.ts'

export type ThreadViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export function deriveThreadViewState(
  conversationId: string | null,
  reducerState: MessagesState,
  threadMessages: Array<Message | PendingMessage>,
): ThreadViewState {
  if (!conversationId) {
    return { status: 'idle' }
  }
  if (reducerState.status === 'loading') {
    return { status: 'loading' }
  }
  if (reducerState.status === 'error') {
    return {
      status: 'error',
      message: reducerState.error ?? 'Unknown error',
    }
  }
  if (reducerState.status === 'success' && threadMessages.length === 0) {
    return { status: 'empty' }
  }
  if (
    reducerState.status === 'success' ||
    reducerState.status === 'loading-more'
  ) {
    return { status: 'success' }
  }
  return { status: 'loading' }
}

export function getThreadScrollAnchorId(
  threadMessages: Array<Message | PendingMessage>,
): string {
  const lastMessage = threadMessages.at(-1)
  if (!lastMessage) return 'empty-thread'
  return 'clientMessageId' in lastMessage
    ? lastMessage.clientMessageId
    : lastMessage.id
}
