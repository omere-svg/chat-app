import type { MessageCitation, MessageRecord } from '../../messages/types/message.entity.js'
import type { ErrorCode } from '../../../shared/errors/error-codes.constants.js'

export type AssistantStreamEvent =
  | { event: 'user_message'; data: { message: MessageRecord } }
  | { event: 'token'; data: { text: string } }
  | { event: 'tool'; data: { name: string } }
  | { event: 'tool_result'; data: { name: string } }
  | { event: 'citations'; data: { citations: MessageCitation[] } }
  | { event: 'done'; data: { message: MessageRecord } }
  | { event: 'error'; data: { code: ErrorCode; message: string } }
