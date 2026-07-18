import { describe, expect, it, vi } from 'vitest'
import { SearchMyMessagesTool } from '../search-my-messages.tool.js'
import type { MessagesService } from '../../../../modules/messages/messages.service.js'
import type { MessageRecord } from '../../../../modules/messages/types/message.entity.js'

function messageFor(userId: string, body: string): MessageRecord {
  return {
    id: `msg-${userId}-${body}`,
    conversationId: `conv-${userId}`,
    senderId: userId,
    body,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

function buildTool(): {
  tool: SearchMyMessagesTool
  searchMessagesAuthoredByUser: ReturnType<typeof vi.fn>
} {
  const searchMessagesAuthoredByUser = vi.fn((userId: string) =>
    Promise.resolve([messageFor(userId, 'venus is hot'), messageFor(userId, 'mars is cold')]),
  )
  const messagesService = { searchMessagesAuthoredByUser } as unknown as MessagesService
  return { tool: new SearchMyMessagesTool(messagesService), searchMessagesAuthoredByUser }
}

describe('SearchMyMessagesTool', () => {
  it('searches only the authenticated user, returning scoped hits', async () => {
    const { tool, searchMessagesAuthoredByUser } = buildTool()

    const result = (await tool.execute({ query: 'is' }, { userId: 'user-a' })) as Array<{
      conversationId: string
      snippet: string
    }>

    expect(searchMessagesAuthoredByUser).toHaveBeenCalledExactlyOnceWith('user-a', 'is', 10)
    expect(result).toEqual([
      { conversationId: 'conv-user-a', snippet: 'venus is hot', createdAt: '2026-01-01T00:00:00.000Z' },
      { conversationId: 'conv-user-a', snippet: 'mars is cold', createdAt: '2026-01-01T00:00:00.000Z' },
    ])
  })

  it('ignores any userId supplied in the model input (scope comes from context only)', async () => {
    const { tool, searchMessagesAuthoredByUser } = buildTool()

    await tool.execute({ query: 'secret', userId: 'user-b' }, { userId: 'user-a' })

    expect(searchMessagesAuthoredByUser).toHaveBeenCalledExactlyOnceWith('user-a', 'secret', 10)
  })

  it('passes a capped limit through to the service', async () => {
    const { tool, searchMessagesAuthoredByUser } = buildTool()

    await tool.execute({ query: 'x', limit: 5 }, { userId: 'user-a' })

    expect(searchMessagesAuthoredByUser).toHaveBeenCalledExactlyOnceWith('user-a', 'x', 5)
  })

  it('rejects an empty query at the boundary', async () => {
    const { tool } = buildTool()

    await expect(tool.execute({ query: '' }, { userId: 'user-a' })).rejects.toThrow()
  })

  it('rejects an out-of-range limit at the boundary', async () => {
    const { tool } = buildTool()

    await expect(tool.execute({ query: 'x', limit: 999 }, { userId: 'user-a' })).rejects.toThrow()
  })
})
