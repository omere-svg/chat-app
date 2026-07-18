import type { MessageDocument } from './message.schema.js'
import type { MessageCitation, MessageMetadata, MessageRecord } from './types/message.entity.js'

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

function toMessageMetadata(
  metadata: MessageDocument['metadata'],
): MessageMetadata | undefined {
  if (metadata === null) {
    return undefined
  }

  const hasCitations = metadata.citations !== undefined && metadata.citations.length > 0
  if (metadata.replyToMessageId === undefined && !hasCitations) {
    return undefined
  }

  const record: MessageMetadata = {}
  if (metadata.replyToMessageId !== undefined) {
    record.replyToMessageId = metadata.replyToMessageId
  }
  if (hasCitations) {
    record.citations = (metadata.citations ?? []).map(
      (citation): MessageCitation => ({
        chunkId: citation.chunkId,
        documentId: citation.documentId,
        documentName: citation.documentName,
        text: citation.text,
        score: citation.score,
      }),
    )
  }
  return record
}
