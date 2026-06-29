// Reserved sender id for messages produced by the AI assistant. It is never a real
// user id, so the FE's own-message check naturally renders these as the other party.
export const ASSISTANT_SENDER_ID = 'assistant'

// A source chunk a tutor answer was grounded in. Persisted on the reply so citations
// survive a reload and stream to the client live; the chunk text is carried so the FE
// can show the source without a follow-up fetch.
export interface MessageCitation {
  chunkId: string
  documentId: string
  documentName: string
  text: string
  // Cosine similarity of the chunk to the question, in [0, 1].
  score: number
}

// Open seam for non-human message provenance. Week 6 sets only replyToMessageId on
// assistant replies; Week 7 adds tutor citations here without a schema reshape.
export interface MessageMetadata {
  // The user message this assistant reply was generated for. Lets a retried send
  // replay the existing exchange idempotently instead of re-invoking the LLM.
  replyToMessageId?: string
  // Source chunks a tutor reply cites. Absent on plain assistant/direct messages.
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
