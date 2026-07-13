import { ASSISTANT_SENDER_ID } from '../../types/domain.ts'
import type {
  Citation,
  Message,
  PendingMessage,
  StreamingMessage,
  ThreadMessage,
} from '../../types/domain.ts'

// Order by createdAt, then by id as a stable tiebreaker so messages created in
// the same millisecond keep a deterministic order (the BE mirrors this rule).
function compareByCreatedAtThenId(messageA: ThreadMessage, messageB: ThreadMessage): number {
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
  // The in-flight assistant reply being streamed, or null. One owner: the reducer.
  streaming: StreamingMessage | null
  nextCursor: string | null
  error: string | null
  loadMoreError: string | null
}

export const initialMessagesState: MessagesState = {
  status: 'idle',
  messages: [],
  pending: [],
  streaming: null,
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
        streaming: state.streaming,
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

    case 'STREAM_START':
      return {
        ...state,
        streaming: {
          id: action.placeholderMessageId,
          conversationId: action.conversationId,
          senderId: ASSISTANT_SENDER_ID,
          body: '',
          createdAt: action.createdAt,
          status: 'streaming',
        },
      }

    case 'STREAM_TOKEN':
      if (state.streaming === null) {
        return state
      }
      return {
        ...state,
        streaming: { ...state.streaming, body: state.streaming.body + action.text },
      }

    case 'STREAM_TOOL':
      if (state.streaming === null) {
        return state
      }
      return {
        ...state,
        streaming: {
          ...state.streaming,
          annotations: {
            ...state.streaming.annotations,
            tools: [...(state.streaming.annotations?.tools ?? []), action.name],
          },
        },
      }

    case 'STREAM_TOOL_RESULT':
      if (state.streaming === null) {
        return state
      }
      return {
        ...state,
        streaming: {
          ...state.streaming,
          annotations: {
            ...state.streaming.annotations,
            completedTools: [
              ...(state.streaming.annotations?.completedTools ?? []),
              action.name,
            ],
          },
        },
      }

    case 'STREAM_CITATIONS':
      if (state.streaming === null) {
        return state
      }
      return {
        ...state,
        streaming: {
          ...state.streaming,
          annotations: { ...state.streaming.annotations, citations: action.citations },
        },
      }

    case 'STREAM_DONE': {
      const withoutDuplicate = state.messages.filter(
        (message) => message.id !== action.message.id,
      )
      return {
        ...state,
        streaming: null,
        messages: [...withoutDuplicate, action.message].sort(compareByCreatedAtThenId),
      }
    }

    case 'STREAM_ERROR':
      return { ...state, streaming: null }
  }
}

export function mergeThreadMessages(
  messages: Message[],
  pendingMessages: PendingMessage[],
  streamingMessage: StreamingMessage | null,
): ThreadMessage[] {
  const threadMessages: ThreadMessage[] = [...messages, ...pendingMessages].sort(
    compareByCreatedAtThenId,
  )
  // The in-flight streaming reply is the live tail of the thread — it's being
  // generated after every existing message — so it always sorts last. Appending it
  // after the sort avoids a createdAt tie with the just-sent optimistic user message
  // (both stamped in the same tick) ordering the reply above it.
  if (streamingMessage !== null) {
    threadMessages.push(streamingMessage)
  }
  return threadMessages
}
