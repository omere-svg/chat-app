import type { CursorPageResult } from '../../shared/pagination/cursor-page.js'
import type { MessageRecord } from './types/message.entity.js'

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

  findAssistantReplyTo(conversationId: string, userMessageId: string): Promise<MessageRecord | null>

  searchAuthoredByUser(userId: string, query: string, limit: number): Promise<MessageRecord[]>

  insert(message: MessageRecord, clientMessageId?: string): Promise<MessageRecord>
}
