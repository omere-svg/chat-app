import type { ConversationType } from '../../conversations/types/conversation.entity.js'
import type { MessageCitation } from '../../messages/types/message.entity.js'

export interface AgentTurnMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateReplyInput {
  userId: string
  conversationId: string
  history: AgentTurnMessage[]
  signal: AbortSignal
}

export type AgentReplyChunk =
  | { type: 'text-delta'; text: string }
  | { type: 'tool-invoked'; name: string }
  | { type: 'tool-result'; name: string }
  | { type: 'citations'; citations: MessageCitation[] }

export interface ConversationReplyStrategy {
  readonly conversationType: ConversationType
  generate(input: GenerateReplyInput): AsyncIterable<AgentReplyChunk>
}
