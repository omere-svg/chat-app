import { describe, expect, it } from 'vitest'
import { deriveConversationTitleFromMessage } from '../conversations/derive-conversation-title.js'

describe('deriveConversationTitleFromMessage', () => {
  it('uses a short message verbatim', () => {
    expect(deriveConversationTitleFromMessage('How do I reset my password?')).toBe(
      'How do I reset my password?',
    )
  })

  it('collapses whitespace and newlines into a single-line title', () => {
    expect(deriveConversationTitleFromMessage('  plan a\n  trip   to Japan  ')).toBe(
      'plan a trip to Japan',
    )
  })

  it('truncates an overlong message with an ellipsis', () => {
    const title = deriveConversationTitleFromMessage('a'.repeat(200))
    expect(title.endsWith('…')).toBe(true)
    // 60 characters plus the ellipsis.
    expect(title).toHaveLength(61)
  })

  it('falls back to the default title for an effectively empty message', () => {
    expect(deriveConversationTitleFromMessage('   \n  ')).toBe('AI Assistant')
  })

  it('truncates on code points so a multi-byte emoji is never split', () => {
    const title = deriveConversationTitleFromMessage('😀'.repeat(70))
    expect(title).toBe(`${'😀'.repeat(60)}…`)
    // No stray replacement character from a severed surrogate pair.
    expect(title).not.toContain('�')
  })
})
