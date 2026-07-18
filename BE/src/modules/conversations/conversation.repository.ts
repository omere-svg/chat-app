import type { ConversationLastMessage, ConversationRecord } from './types/conversation.entity.js'

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY')

export interface ConversationRepository {
  isEmpty(): Promise<boolean>

  findById(conversationId: string): Promise<ConversationRecord | null>

  findByParticipantSortedByActivity(userId: string): Promise<ConversationRecord[]>

  findByParticipantSet(participantIds: readonly string[]): Promise<ConversationRecord | null>

  insert(conversation: ConversationRecord): Promise<ConversationRecord>

  advanceLastMessageIfNewer(conversationId: string, lastMessage: ConversationLastMessage): Promise<void>

  setTitleIfCurrentTitleMatches(
    conversationId: string,
    title: string,
    expectedCurrentTitle: string,
  ): Promise<void>
}
