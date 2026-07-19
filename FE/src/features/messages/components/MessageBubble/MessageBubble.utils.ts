import type {
  Citation,
  PendingMessage,
  StreamingMessage,
  ThreadMessage,
} from '@/types/domain.ts'
import { MESSAGE_BUBBLE_CLASS, MESSAGE_ROW_CLASS } from './MessageBubble.constants.ts'

export function isPendingMessage(
  message: ThreadMessage,
): message is PendingMessage {
  return 'clientMessageId' in message
}

export function isStreamingMessage(
  message: ThreadMessage,
): message is StreamingMessage {
  return 'status' in message
}

export function messageRowClassName(isOwnMessage: boolean): string {
  return isOwnMessage ? MESSAGE_ROW_CLASS.own : MESSAGE_ROW_CLASS.base
}

export function messageBubbleClassName(
  isOwnMessage: boolean,
  isPending: boolean,
  isStreaming: boolean,
): string {
  return [
    MESSAGE_BUBBLE_CLASS.base,
    isOwnMessage ? MESSAGE_BUBBLE_CLASS.own : '',
    isPending ? MESSAGE_BUBBLE_CLASS.pending : '',
    isStreaming ? MESSAGE_BUBBLE_CLASS.streaming : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function extractCitations(
  message: ThreadMessage,
  streaming: StreamingMessage | null,
): Citation[] {
  if (streaming) {
    return streaming.annotations?.citations ?? []
  }
  return message.metadata?.citations ?? []
}
