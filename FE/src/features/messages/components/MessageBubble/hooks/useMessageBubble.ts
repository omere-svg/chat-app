import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { useSenders } from '@/features/messages/context/useSendersContext.tsx'
import { UNKNOWN_SENDER_NAME } from '@/features/messages/context/senders.constants.ts'
import type { ThreadMessage } from '@/types/domain.ts'
import type { MessageBubbleContextValue } from '../context/useMessageBubbleContext.types.ts'
import { MESSAGE_META_TEXT } from '../components/MessageMeta/MessageMeta.constants.ts'
import { formatClockTime } from '../components/MessageMeta/MessageMeta.utils.ts'
import {
  extractCitations,
  isPendingMessage,
  isStreamingMessage,
  messageBubbleClassName,
  messageRowClassName,
} from '../MessageBubble.utils.ts'

function deriveMetaStatusLabel(isPending: boolean, body: string): string {
  if (isPending) {
    return MESSAGE_META_TEXT.pending
  }
  return body.length === 0 ? MESSAGE_META_TEXT.thinking : MESSAGE_META_TEXT.typing
}

export function useMessageBubble(message: ThreadMessage): MessageBubbleContextValue {
  const { currentUser } = useAuth()
  const { getSender } = useSenders()

  const sender = getSender(message.senderId)
  const senderName = sender?.name ?? UNKNOWN_SENDER_NAME
  const isOwnMessage = message.senderId === (currentUser?.id ?? '')

  const isPending = isPendingMessage(message)
  const streaming = isStreamingMessage(message) ? message : null
  const isStreaming = streaming !== null

  return {
    senderName,
    avatarUrl: sender?.avatarUrl ?? null,
    rowClassName: messageRowClassName(isOwnMessage),
    bubbleClassName: messageBubbleClassName(isOwnMessage, isPending, isStreaming),
    body: message.body,
    showCursor: isStreaming,
    isPending,
    isStreaming,
    createdAt: message.createdAt,
    tools: streaming?.annotations?.tools ?? [],
    completedTools: streaming?.annotations?.completedTools ?? [],
    citations: extractCitations(message, streaming),
    metaStatusLabel: deriveMetaStatusLabel(isPending, message.body),
    metaIsLive: isStreaming,
    metaTimeLabel: formatClockTime(message.createdAt),
    metaDateTime: message.createdAt,
  }
}
