import type { ConversationLastMessage, ConversationRecord } from '../conversation.entity.js'

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY')

export interface ConversationRepository {
  isEmpty(): Promise<boolean>

  findById(conversationId: string): Promise<ConversationRecord | null>

  // Returns the participant's conversations sorted by last activity (newest first).
  findByParticipant(userId: string): Promise<ConversationRecord[]>

  findByParticipantSet(participantIds: readonly string[]): Promise<ConversationRecord | null>

  insert(conversation: ConversationRecord): Promise<ConversationRecord>

  // Advances the denormalized last-message snapshot, but only when the incoming
  // message is newer than what is already recorded (monotonic, idempotent).
  advanceLastMessage(conversationId: string, lastMessage: ConversationLastMessage): Promise<void>
}
