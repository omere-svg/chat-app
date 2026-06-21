import type { MessageRecord } from '../messages/message.entity.js'

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
  title: string
  participantIds: string[]
  lastActivityAt: string
  lastMessage: ConversationLastMessage | null
  createdAt: string
}
