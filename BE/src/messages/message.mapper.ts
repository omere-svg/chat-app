import { MessageDocument } from './message.schema.js'
import type { MessageRecord } from './message.entity.js'

export function toMessageRecord(document: MessageDocument): MessageRecord {
  return {
    id: document._id,
    conversationId: document.conversationId,
    senderId: document.senderId,
    body: document.body,
    createdAt: document.createdAt.toISOString(),
  }
}
