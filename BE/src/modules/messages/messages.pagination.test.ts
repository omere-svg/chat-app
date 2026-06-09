import { describe, expect, it } from 'vitest'
import { paginateMessages } from './messages.pagination.js'
import { ApiError } from '../../shared/ApiError.js'
import type { Message } from '../../domain/types.js'

function buildMessages(count: number): Message[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `m-${index + 1}`,
    conversationId: 'c',
    senderId: 'u',
    body: `body ${index + 1}`,
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
  }))
}

describe('paginateMessages', () => {
  it('returns an empty page when there are no messages', () => {
    expect(paginateMessages([], undefined, 10)).toEqual({
      messages: [],
      nextCursor: null,
    })
  })

  it('returns the newest page first with a cursor to older messages', () => {
    const page = paginateMessages(buildMessages(5), undefined, 2)
    expect(page.messages.map((message) => message.id)).toEqual(['m-4', 'm-5'])
    expect(page.nextCursor).toBe('m-4')
  })

  it('walks backwards into older history using the cursor', () => {
    const page = paginateMessages(buildMessages(5), 'm-4', 2)
    expect(page.messages.map((message) => message.id)).toEqual(['m-2', 'm-3'])
    expect(page.nextCursor).toBe('m-2')
  })

  it('returns a null cursor once the oldest message is included', () => {
    const page = paginateMessages(buildMessages(5), 'm-2', 10)
    expect(page.messages.map((message) => message.id)).toEqual(['m-1'])
    expect(page.nextCursor).toBeNull()
  })

  it('returns everything with a null cursor when limit exceeds the count', () => {
    const page = paginateMessages(buildMessages(3), undefined, 50)
    expect(page.messages).toHaveLength(3)
    expect(page.nextCursor).toBeNull()
  })

  it('throws INVALID_CURSOR for an unknown cursor', () => {
    try {
      paginateMessages(buildMessages(3), 'does-not-exist', 2)
      expect.unreachable('expected paginateMessages to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).code).toBe('INVALID_CURSOR')
      expect((error as ApiError).status).toBe(400)
    }
  })
})
