export interface MessageCitation {
  chunkId: string
  documentId: string
  documentName: string
  text: string
  score: number
}

export interface MessageMetadata {
  replyToMessageId?: string
  citations?: MessageCitation[]
}

export interface MessageRecord {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
  metadata?: MessageMetadata
}
