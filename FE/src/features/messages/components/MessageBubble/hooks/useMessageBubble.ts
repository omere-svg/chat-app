import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { useSenders } from '@/features/messages/context/useSendersContext.tsx'
import { UNKNOWN_SENDER_NAME } from '@/features/messages/context/senders.constants.ts'
import type { ThreadMessage } from '@/types/domain.ts'
import type { MessageBubbleContextValue } from '../context/useMessageBubbleContext.types.ts'
import {
  extractCitations,
  isPendingMessage,
  isStreamingMessage,
  messageBubbleClassName,
  messageRowClassName,
} from '../MessageBubble.utils.ts'

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
  }
}
