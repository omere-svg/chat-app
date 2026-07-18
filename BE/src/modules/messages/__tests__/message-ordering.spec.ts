import { describe, expect, it } from 'vitest'
import { compareMessagesByCreatedAtAscending } from '../message-ordering.js'
import type { MessageRecord } from '../types/message.entity.js'

function makeMessage(id: string, createdAt: string): MessageRecord {
  return { id, conversationId: 'conv-1', senderId: 'user-1', body: 'x', createdAt }
}

describe('compareMessagesByCreatedAtAscending', () => {
  it('orders by createdAt ascending', () => {
    const earlier = makeMessage('msg-z', '2026-01-01T00:00:00.000Z')
    const later = makeMessage('msg-a', '2026-01-01T00:00:01.000Z')

    expect(compareMessagesByCreatedAtAscending(earlier, later)).toBeLessThan(0)
    expect(compareMessagesByCreatedAtAscending(later, earlier)).toBeGreaterThan(0)
  })

  it('falls back to id when createdAt is identical', () => {
    const sameTime = '2026-01-01T00:00:00.000Z'
    const first = makeMessage('msg-a', sameTime)
    const second = makeMessage('msg-b', sameTime)

    expect(compareMessagesByCreatedAtAscending(first, second)).toBeLessThan(0)
    expect(compareMessagesByCreatedAtAscending(second, first)).toBeGreaterThan(0)
    expect(compareMessagesByCreatedAtAscending(first, first)).toBe(0)
  })
})
