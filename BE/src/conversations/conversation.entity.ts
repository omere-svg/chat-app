export interface ConversationLastMessage {
  body: string
  senderId: string
  createdAt: string
}

export function toLastMessageSnapshot(message: ConversationLastMessage): ConversationLastMessage {
  return { body: message.body, senderId: message.senderId, createdAt: message.createdAt }
}

export interface ConversationRecord {
  id: string
  title: string
  participantIds: string[]
  lastMessageAt: string
  lastMessage: ConversationLastMessage | null
  createdAt: string
}
