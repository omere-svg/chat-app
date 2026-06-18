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

  insert(message: MessageRecord, clientMessageId?: string): Promise<MessageRecord>
}
