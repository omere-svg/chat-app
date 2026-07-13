import type { CursorPageResult } from '../../shared/pagination/cursor-page.js'
import type { MessageRecord } from '../message.entity.js'

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY')

export interface MessageRepository {
  isEmpty(): Promise<boolean>

  findMessagePage(
    conversationId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<CursorPageResult<MessageRecord>>

  findByClientMessageId(
    conversationId: string,
    clientMessageId: string,
  ): Promise<MessageRecord | null>

  // Returns the assistant reply previously generated for a user message, if any.
  // Backs idempotent replay of an assistant exchange.
  findAssistantReplyTo(conversationId: string, userMessageId: string): Promise<MessageRecord | null>

  // Full-text-ish search over the messages a user authored (senderId === userId),
  // newest first. Backs the search_my_messages agent tool; scoped to the caller so it
  // can never surface another user's messages.
  searchAuthoredByUser(userId: string, query: string, limit: number): Promise<MessageRecord[]>

  insert(message: MessageRecord, clientMessageId?: string): Promise<MessageRecord>
}
