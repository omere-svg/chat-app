// Reserved sender id for messages produced by the AI assistant. It is never a real
// user id, so the FE's own-message check naturally renders these as the other party.
export const ASSISTANT_SENDER_ID = 'assistant'

// Open seam for non-human message provenance. Week 6 sets only replyToMessageId on
// assistant replies; later weeks add citations/sources here without a schema reshape.
export interface MessageMetadata {
  // The user message this assistant reply was generated for. Lets a retried send
  // replay the existing exchange idempotently instead of re-invoking the LLM.
  replyToMessageId?: string
}

export interface MessageRecord {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
  metadata?: MessageMetadata
}
