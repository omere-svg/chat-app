import type { CursorPageResult } from '../../shared/pagination/cursor-pagination.js'
import type { MessageRecord } from '../message.entity.js'

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY')

export interface MessageRepository {
  findMessagePage(
    conversationId: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<CursorPageResult<MessageRecord>>

  findLatestByConversationIds(
    conversationIds: readonly string[],
  ): Promise<ReadonlyMap<string, MessageRecord>>

  findByClientMessageId(
    conversationId: string,
    clientMessageId: string,
  ): Promise<MessageRecord | null>

  insert(message: MessageRecord, clientMessageId?: string): Promise<MessageRecord>
}
