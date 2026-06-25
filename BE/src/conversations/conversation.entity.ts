import type { MessageRecord } from '../messages/message.entity.js'

// 'direct' is a human-to-human conversation; 'assistant' is an AI chat backed by
// an LLM. 'tutor' is reserved for the Week 7 RAG mode and is not produced yet.
export type ConversationType = 'direct' | 'assistant' | 'tutor'

export const DEFAULT_CONVERSATION_TYPE: ConversationType = 'direct'

// Placeholder title an assistant conversation carries until its first user message
// renames it (see deriveConversationTitleFromMessage).
export const DEFAULT_ASSISTANT_CONVERSATION_TITLE = 'AI Assistant'

export interface ConversationLastMessage {
  body: string
  senderId: string
  createdAt: string
}

export function toLastMessageSnapshot(message: MessageRecord): ConversationLastMessage {
  return { body: message.body, senderId: message.senderId, createdAt: message.createdAt }
}

export interface ConversationRecord {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  lastActivityAt: string
  lastMessage: ConversationLastMessage | null
  createdAt: string
}
