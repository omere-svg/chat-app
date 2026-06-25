import { ConversationDocument } from './conversation.schema.js'
import type { ConversationRecord } from './conversation.entity.js'

export function toConversationRecord(document: ConversationDocument): ConversationRecord {
  return {
    id: document._id,
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
