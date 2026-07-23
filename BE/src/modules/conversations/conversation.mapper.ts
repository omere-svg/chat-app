import { DEFAULT_CONVERSATION_TYPE } from './constants.js'
import type { ConversationDocument } from './conversation.schema.js'
import type {
  ConversationLastMessage,
  ConversationRecord,
} from './types/conversation.entity.js'
import type { ConversationPreview } from './types/conversation-preview.js'
import type { ConversationParticipantView } from './types/conversation-participant-view.js'
import type { User } from '../users/types/user.js'
import type { MessageRecord } from '../messages/types/message.entity.js'

export function toLastMessageSnapshot(message: MessageRecord): ConversationLastMessage {
  return { body: message.body, senderId: message.senderId, createdAt: message.createdAt }
}

export function toConversationParticipantView(user: User): ConversationParticipantView {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
  }
}

export function toConversationPreview(
  conversation: ConversationRecord,
  participants: ConversationParticipantView[],
): ConversationPreview {
  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    participantIds: [...conversation.participantIds],
    participants,
    lastMessage: conversation.lastMessage,
    updatedAt: conversation.lastActivityAt,
  }
}

export function toConversationRecord(document: ConversationDocument): ConversationRecord {
  return {
    id: document._id,
    type: document.type ?? DEFAULT_CONVERSATION_TYPE,
    title: document.title,
    participantIds: [...document.participantIds],
    lastActivityAt: document.lastActivityAt.toISOString(),
    lastMessage:
      document.lastMessage === null
        ? null
        : {
            body: document.lastMessage.body,
            senderId: document.lastMessage.senderId,
            createdAt: document.lastMessage.createdAt.toISOString(),
          },
    createdAt: document.createdAt.toISOString(),
  }
}

export function toConversationDocumentInput(conversation: ConversationRecord): ConversationDocument {
  return {
    _id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    participantIds: [...conversation.participantIds],
    lastActivityAt: new Date(conversation.lastActivityAt),
    lastMessage:
      conversation.lastMessage === null
        ? null
        : {
            body: conversation.lastMessage.body,
            senderId: conversation.lastMessage.senderId,
            createdAt: new Date(conversation.lastMessage.createdAt),
          },
    createdAt: new Date(conversation.createdAt),
  }
}
