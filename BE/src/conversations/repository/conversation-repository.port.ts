import type { ConversationRecord } from '../conversation.entity.js'

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY')

export interface ConversationRepository {
  findById(conversationId: string): Promise<ConversationRecord | null>

  findByParticipant(userId: string): Promise<ConversationRecord[]>

  findByParticipantSet(participantIds: readonly string[]): Promise<ConversationRecord | null>

  insert(conversation: ConversationRecord): Promise<ConversationRecord>
}
