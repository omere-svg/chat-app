import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { useSenders } from '@/features/messages/context/useSendersContext.tsx'
import { UNKNOWN_SENDER_NAME } from '@/features/messages/context/senders.constants.ts'
import { MessageCitationsContainer } from '../MessageCitations/MessageCitationsContainer.tsx'
import { MessageMetaContainer } from './components/MessageMeta/MessageMetaContainer.tsx'
import { MessageToolsContainer } from './components/MessageTools/MessageToolsContainer.tsx'
import { MessageBubble } from './MessageBubble.tsx'
import type { MessageBubbleContainerProps } from './MessageBubble.types.ts'
import {
  extractCitations,
  isPendingMessage,
  isStreamingMessage,
  messageBubbleClassName,
  messageRowClassName,
} from './MessageBubble.utils.ts'

export function MessageBubbleContainer({
  message,
}: MessageBubbleContainerProps): React.ReactElement {
  const { currentUser } = useAuth()
  const { getSender } = useSenders()

  const sender = getSender(message.senderId)
  const senderName = sender?.name ?? UNKNOWN_SENDER_NAME
  const isOwnMessage = message.senderId === (currentUser?.id ?? '')

  const isPending = isPendingMessage(message)
  const streaming = isStreamingMessage(message) ? message : null
  const tools = streaming?.annotations?.tools ?? []
  const completedTools = streaming?.annotations?.completedTools ?? []
  const citations = extractCitations(message, streaming)

  const toolsNode =
    tools.length > 0 ? (
      <MessageToolsContainer tools={tools} completedTools={completedTools} />
    ) : null

  const citationsNode =
    citations.length > 0 ? (
      <MessageCitationsContainer citations={citations} />
    ) : null

  return (
    <MessageBubble
      rowClassName={messageRowClassName(isOwnMessage)}
      className={messageBubbleClassName(
        isOwnMessage,
        isPending,
        streaming !== null,
      )}
      avatar={
        <UserAvatarContainer
          name={senderName}
          imageUrl={sender?.avatarUrl ?? null}
          size="sm"
        />
      }
      body={message.body}
      showCursor={streaming !== null}
      tools={toolsNode}
      citations={citationsNode}
      meta={
        <MessageMetaContainer
          isPending={isPending}
          isStreaming={streaming !== null}
          body={message.body}
          createdAt={message.createdAt}
        />
      }
    />
  )
}
