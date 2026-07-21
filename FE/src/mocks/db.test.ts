import { afterEach, describe, expect, it } from 'vitest'
import {
  getUserConversations,
  requestEmailChange,
  resetDb,
  updateUserName,
} from './db.ts'

afterEach(() => {
  resetDb()
})

describe('mock db direct-conversation titles', () => {
  it('derives a direct conversation title from participants current names', () => {
    const conversations = getUserConversations('user-alice')
    const aliceBob = conversations.find((c) => c.id === 'conv-alice-bob')

    expect(aliceBob?.title).toBe('Alice Anderson & Bob Brown')
  })

  it('reflects a renamed participant in the derived title', () => {
    updateUserName('user-alice', 'Alicia', 'Andrews')

    const conversations = getUserConversations('user-alice')
    const aliceBob = conversations.find((c) => c.id === 'conv-alice-bob')

    expect(aliceBob?.title).toBe('Alicia Andrews & Bob Brown')
  })
})

describe('mock db email change requests', () => {
  it('rejects a malformed email', () => {
    expect(requestEmailChange('user-alice', 'not-an-email')).toEqual({
      error: 'VALIDATION_ERROR',
    })
  })

  it('rejects an email over 254 characters', () => {
    const overlongEmail = `${'a'.repeat(243)}@example.com`

    expect(requestEmailChange('user-alice', overlongEmail)).toEqual({
      error: 'VALIDATION_ERROR',
    })
  })
})
