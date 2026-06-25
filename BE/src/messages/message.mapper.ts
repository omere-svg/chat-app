import type { MessageDocument } from './message.schema.js'
import type { MessageMetadata, MessageRecord } from './message.entity.js'

export function toMessageRecord(document: MessageDocument): MessageRecord {
  const record: MessageRecord = {
    id: document._id,
    conversationId: document.conversationId,
    senderId: document.senderId,
    body: document.body,
    createdAt: document.createdAt.toISOString(),
  }

  const metadata = toMessageMetadata(document.metadata)
  if (metadata !== undefined) {
    record.metadata = metadata
  }

  return record
}

// Collapses an empty/null metadata sub-document to undefined so ordinary messages
// keep their lean shape and never expose an empty {} on the wire.
function toMessageMetadata(
  metadata: MessageDocument['metadata'],
): MessageMetadata | undefined {
  if (metadata === null || metadata.replyToMessageId === undefined) {
    return undefined
  }
  return { replyToMessageId: metadata.replyToMessageId }
}
