import { afterEach, describe, expect, it } from 'vitest'
import {
  getUserConversations,
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
