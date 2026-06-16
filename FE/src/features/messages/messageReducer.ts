import type { Message, PendingMessage } from '../../types/domain.ts'

// Order by createdAt, then by id as a stable tiebreaker so messages created in
// the same millisecond keep a deterministic order (the BE mirrors this rule).
function compareByCreatedAtThenId(
  messageA: Message | PendingMessage,
  messageB: Message | PendingMessage,
): number {
  const timeDelta =
    new Date(messageA.createdAt).getTime() - new Date(messageB.createdAt).getTime()
  if (timeDelta !== 0) {
    return timeDelta
  }
  if (messageA.id < messageB.id) {
    return -1
  }
  if (messageA.id > messageB.id) {
    return 1
  }
  return 0
}

export type MessagesState = {
  status: 'idle' | 'loading' | 'loading-more' | 'success' | 'error'
  messages: Message[]
  pending: PendingMessage[]
  nextCursor: string | null
  error: string | null
  loadMoreError: string | null
}

export const initialMessagesState: MessagesState = {
  status: 'idle',
  messages: [],
  pending: [],
  nextCursor: null,
  error: null,
  loadMoreError: null,
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

export function messageReducer(
  state: MessagesState,
  action: MessagesAction,
): MessagesState {
  switch (action.type) {
    case 'RESET':
      return { ...initialMessagesState, status: 'loading' }

    case 'FETCH_START':
      return {
        ...initialMessagesState,
        status: 'loading',
      }

    case 'FETCH_SUCCESS':
      return {
        status: 'success',
        messages: action.messages,
        pending: state.pending,
        nextCursor: action.nextCursor,
        error: null,
        loadMoreError: null,
      }

    case 'FETCH_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      }

    case 'FETCH_MORE_START':
      return {
        ...state,
        status: 'loading-more',
        loadMoreError: null,
      }

    case 'FETCH_MORE_SUCCESS':
      return {
        ...state,
        status: 'success',
        messages: [...action.messages, ...state.messages],
        nextCursor: action.nextCursor,
        loadMoreError: null,
      }

    case 'FETCH_MORE_ERROR':
      return {
        ...state,
        status: 'success',
        loadMoreError: action.error,
      }

    case 'OPTIMISTIC_ADD':
      return {
        ...state,
        pending: [...state.pending, action.message],
      }

    case 'OPTIMISTIC_CONFIRM': {
      const pendingMessages = state.pending.filter(
        (pendingMessage) =>
          pendingMessage.clientMessageId !== action.clientMessageId,
      )
      const confirmedMessages = state.messages.filter(
        (message) => message.id !== action.message.id,
      )
      return {
        ...state,
        pending: pendingMessages,
        messages: [...confirmedMessages, action.message].sort(
          compareByCreatedAtThenId,
        ),
      }
    }

    case 'OPTIMISTIC_ROLLBACK':
      return {
        ...state,
        pending: state.pending.filter(
          (pendingMessage) =>
            pendingMessage.clientMessageId !== action.clientMessageId,
        ),
      }
  }
}

export function mergeThreadMessages(
  messages: Message[],
  pendingMessages: PendingMessage[],
): Array<Message | PendingMessage> {
  return [...messages, ...pendingMessages].sort(compareByCreatedAtThenId)
}
