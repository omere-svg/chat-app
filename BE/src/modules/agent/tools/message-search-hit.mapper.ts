import { TOOL_SNIPPET_MAX_LENGTH } from './constants.js'
import type { MessageRecord } from '../../../modules/messages/types/message.entity.js'
import type { MessageSearchHit } from '../types/message-search-hit.js'

export function toMessageSearchHit(message: MessageRecord): MessageSearchHit {
  return {
    conversationId: message.conversationId,
    snippet: message.body.slice(0, TOOL_SNIPPET_MAX_LENGTH),
    createdAt: message.createdAt,
  }
}
