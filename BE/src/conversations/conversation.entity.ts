import type { MessageRecord } from '../messages/message.entity.js'

// 'direct' is a human-to-human conversation; 'assistant' is an AI chat backed by
// an LLM; 'tutor' is the Week 7 RAG mode that answers from the user's knowledge base.
export type ConversationType = 'direct' | 'assistant' | 'tutor'

export const DEFAULT_CONVERSATION_TYPE: ConversationType = 'direct'

// Placeholder title an assistant conversation carries until its first user message
// renames it (see deriveConversationTitleFromMessage).
export const DEFAULT_ASSISTANT_CONVERSATION_TITLE = 'AI Assistant'

// Title a tutor conversation carries. Unlike assistant chats it is not auto-renamed
// from the first message, so it stays distinct in the conversation list.
export const DEFAULT_TUTOR_CONVERSATION_TITLE = 'AI Tutor'

// Conversation types whose replies are produced by an LLM and streamed over SSE
// through the assistant reply path, rather than persisted as a plain JSON message.
export function isAssistantReplyType(type: ConversationType): boolean {
  return type === 'assistant' || type === 'tutor'
}

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
