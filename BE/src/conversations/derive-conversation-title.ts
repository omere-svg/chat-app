import { DEFAULT_ASSISTANT_CONVERSATION_TITLE } from './conversation.entity.js'

const MAX_TITLE_LENGTH = 60

// Builds an assistant-conversation title from a user message: a whitespace-collapsed,
// single-line snippet truncated to a sane length (mirroring how chat apps title new
// threads). Falls back to the default title for an effectively empty message.
export function deriveConversationTitleFromMessage(messageBody: string): string {
  const normalized = messageBody.replace(/\s+/g, ' ').trim()
  if (normalized.length === 0) {
    return DEFAULT_ASSISTANT_CONVERSATION_TITLE
  }
  // Slice on code points, not UTF-16 units, so truncation never splits a surrogate
  // pair (e.g. an emoji) and leaves a stray replacement character.
  const codePoints = [...normalized]
  if (codePoints.length <= MAX_TITLE_LENGTH) {
    return normalized
  }
  return `${codePoints.slice(0, MAX_TITLE_LENGTH).join('').trimEnd()}…`
}
