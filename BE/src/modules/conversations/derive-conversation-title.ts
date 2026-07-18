import { DEFAULT_ASSISTANT_CONVERSATION_TITLE, MAX_DERIVED_TITLE_LENGTH } from './constants.js'

export function deriveConversationTitleFromMessage(messageBody: string): string {
  const normalized = messageBody.replace(/\s+/g, ' ').trim()
  if (normalized.length === 0) {
    return DEFAULT_ASSISTANT_CONVERSATION_TITLE
  }
  const codePoints = [...normalized]
  if (codePoints.length <= MAX_DERIVED_TITLE_LENGTH) {
    return normalized
  }
  return `${codePoints.slice(0, MAX_DERIVED_TITLE_LENGTH).join('').trimEnd()}…`
}
