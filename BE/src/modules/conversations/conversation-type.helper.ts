import type { ConversationType } from './types/conversation.entity.js'

export function isAssistantReplyType(type: ConversationType): boolean {
  return type === 'assistant' || type === 'tutor'
}
