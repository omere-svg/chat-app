import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { MessageBubbleContainer } from '../MessageBubble/MessageBubbleContainer.tsx'
import { MessageList } from './MessageList.tsx'
import { MESSAGE_LIST_UNKNOWN_SENDER } from './MessageList.constants.ts'
import type { MessageListContainerProps, SenderProfile } from './MessageList.types.ts'

export function MessageListContainer({
  messages,
  currentUserId,
  senders,
}: MessageListContainerProps): React.ReactElement {
  const sendersById = new Map<string, SenderProfile>(
    senders.map((sender) => [sender.id, sender]),
  )

  const items = messages.map((message) => {
    const sender = sendersById.get(message.senderId)
    const senderName = sender?.name ?? MESSAGE_LIST_UNKNOWN_SENDER
    return (
      <MessageBubbleContainer
        key={'clientMessageId' in message ? message.clientMessageId : message.id}
        message={message}
        isOwnMessage={message.senderId === currentUserId}
        avatar={
          <UserAvatarContainer
            name={senderName}
            imageUrl={sender?.avatarUrl ?? null}
            size="sm"
          />
        }
      />
    )
  })

  return <MessageList items={items} />
}
