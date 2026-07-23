import type { Request } from 'express'
import type { ConversationRecord } from '../../conversations/types/conversation.entity.js'

export interface ConversationRequest extends Request {
  conversation?: ConversationRecord
}
