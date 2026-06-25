import { describe, expect, it, vi } from 'vitest'
import { ListMyConversationsTool } from '../assistant/tools/list-my-conversations.tool.js'
import type { ConversationsService } from '../conversations/conversations.service.js'
import type { ConversationRecord } from '../conversations/conversation.entity.js'

function conversationFor(ownerId: string, suffix: string): ConversationRecord {
  return {
    id: `conv-${ownerId}-${suffix}`,
    type: 'direct',
    title: `${ownerId}'s chat ${suffix}`,
    participantIds: [ownerId],
    lastActivityAt: '2026-01-01T00:00:00.000Z',
    lastMessage: { body: `secret of ${ownerId}`, senderId: ownerId, createdAt: '2026-01-01T00:00:00.000Z' },
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

function buildTool(): { tool: ListMyConversationsTool; listForParticipant: ReturnType<typeof vi.fn> } {
  const conversationsByUser: Record<string, ConversationRecord[]> = {
    'user-a': [conversationFor('user-a', '1'), conversationFor('user-a', '2')],
    'user-b': [conversationFor('user-b', '1')],
  }
  const listForParticipant = vi.fn((userId: string) =>
    Promise.resolve(conversationsByUser[userId] ?? []),
  )
  const conversationsService = { listForParticipant } as unknown as ConversationsService
  return { tool: new ListMyConversationsTool(conversationsService), listForParticipant }
}

describe('ListMyConversationsTool', () => {
  it('returns only the calling user\'s conversations in the scoped view', async () => {
    const { tool, listForParticipant } = buildTool()

    const result = await tool.execute({}, { userId: 'user-a' })

    expect(listForParticipant).toHaveBeenCalledExactlyOnceWith('user-a')
    expect(result).toEqual([
      {
        id: 'conv-user-a-1',
        type: 'direct',
        title: "user-a's chat 1",
        updatedAt: '2026-01-01T00:00:00.000Z',
        lastMessageSnippet: 'secret of user-a',
      },
      {
        id: 'conv-user-a-2',
        type: 'direct',
        title: "user-a's chat 2",
        updatedAt: '2026-01-01T00:00:00.000Z',
        lastMessageSnippet: 'secret of user-a',
      },
    ])
  })

  it('never leaks another user\'s data, even if the model supplies a userId in the input', async () => {
    const { tool, listForParticipant } = buildTool()

    // A malicious/hallucinated userId in the tool input must be ignored — scoping
    // comes only from the authenticated context.
    const result = (await tool.execute(
      { userId: 'user-b' },
      { userId: 'user-a' },
    )) as Array<{ id: string }>

    expect(listForParticipant).toHaveBeenCalledExactlyOnceWith('user-a')
    expect(result.every((conversation) => conversation.id.startsWith('conv-user-a'))).toBe(true)
  })

  it('caps results at the requested limit', async () => {
    const { tool } = buildTool()

    const result = (await tool.execute({ limit: 1 }, { userId: 'user-a' })) as unknown[]

    expect(result).toHaveLength(1)
  })

  it('rejects an out-of-range limit at the boundary', async () => {
    const { tool } = buildTool()

    await expect(tool.execute({ limit: 999 }, { userId: 'user-a' })).rejects.toThrow()
  })
})
