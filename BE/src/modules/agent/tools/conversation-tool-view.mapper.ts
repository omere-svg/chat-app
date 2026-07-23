import { TOOL_SNIPPET_MAX_LENGTH } from './constants.js'
import type { ConversationRecord } from '../../../modules/conversations/types/conversation.entity.js'
import type { ConversationToolView } from '../types/conversation-tool-view.js'

export function toConversationToolView(conversation: ConversationRecord): ConversationToolView {
  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    updatedAt: conversation.lastActivityAt,
    lastMessageSnippet:
      conversation.lastMessage === null
        ? null
        : conversation.lastMessage.body.slice(0, TOOL_SNIPPET_MAX_LENGTH),
  }
}
