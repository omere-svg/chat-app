import type { ConversationRecord } from '../conversations/conversation.entity.js'
import type { MessageRecord } from '../messages/message.entity.js'

export interface ConversationPreview {
  id: string
  title: string
  participantIds: string[]
  lastMessage: { body: string; createdAt: string; senderId: string } | null
  updatedAt: string
}

export function toConversationPreview(
  conversation: ConversationRecord,
  latestMessage: MessageRecord | null,
): ConversationPreview {
  return {
    id: conversation.id,
    title: conversation.title,
    participantIds: [...conversation.participantIds],
    lastMessage:
      latestMessage === null
        ? null
        : {
            body: latestMessage.body,
            createdAt: latestMessage.createdAt,
            senderId: latestMessage.senderId,
          },
    updatedAt: latestMessage?.createdAt ?? conversation.createdAt,
  }
}
