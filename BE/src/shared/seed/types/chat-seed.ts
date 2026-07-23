import type { ConversationRecord } from '../../../modules/conversations/types/conversation.entity.js'
import type { MessageRecord } from '../../../modules/messages/types/message.entity.js'

export interface ChatSeed {
  conversations: readonly ConversationRecord[]
  messagesByConversationId: ReadonlyMap<string, readonly MessageRecord[]>
}
