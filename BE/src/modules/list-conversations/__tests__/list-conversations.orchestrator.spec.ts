import { describe, expect, it, vi } from 'vitest'
import { ListConversationsOrchestrator } from '../list-conversations.orchestrator.js'
import { ConversationParticipantsMapper } from '../../../shared/conversation-participants/conversation-participants.mapper.js'
import type { ConversationsService } from '../../conversations/conversations.service.js'
import type { UsersService } from '../../users/users.service.js'
import type { ConversationRecord } from '../../conversations/types/conversation.entity.js'
import type { User } from '../../users/types/user.js'

const alice: User = { id: 'user-a', email: 'a@example.com', firstName: 'Alice', lastName: 'Adams', avatarUrl: null }
const bob: User = { id: 'user-b', email: 'b@example.com', firstName: 'Bob', lastName: 'Brown', avatarUrl: null }

function directConversation(overrides: Partial<ConversationRecord> = {}): ConversationRecord {
  return {
    id: 'conv-1',
    type: 'direct',
    title: 'Stale Snapshot',
    participantIds: ['user-a', 'user-b'],
    lastActivityAt: '2026-01-01T00:00:00.000Z',
    lastMessage: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function buildOrchestrator(
  conversations: ConversationRecord[],
  knownUsers: User[],
): ListConversationsOrchestrator {
  const conversationsService = {
    listForParticipant: vi.fn().mockResolvedValue(conversations),
  } as unknown as ConversationsService
  const usersService = {
    findUsersByIds: vi.fn().mockResolvedValue(knownUsers),
  } as unknown as UsersService

  return new ListConversationsOrchestrator(
    conversationsService,
    usersService,
    new ConversationParticipantsMapper(),
  )
}

describe('ListConversationsOrchestrator', () => {
  it('derives a direct conversation title from participants current names', async () => {
    const orchestrator = buildOrchestrator([directConversation()], [alice, bob])

    const [preview] = await orchestrator.listForUser('user-a')

    expect(preview?.title).toBe('Alice Adams & Bob Brown')
  })

  it('reflects a renamed participant', async () => {
    const renamedBob: User = { ...bob, firstName: 'Robert', lastName: 'Brown' }
    const orchestrator = buildOrchestrator([directConversation()], [alice, renamedBob])

    const [preview] = await orchestrator.listForUser('user-a')

    expect(preview?.title).toBe('Alice Adams & Robert Brown')
  })

  it('keeps the stored title when a participant cannot be resolved', async () => {
    const orchestrator = buildOrchestrator([directConversation()], [alice])

    const [preview] = await orchestrator.listForUser('user-a')

    expect(preview?.title).toBe('Stale Snapshot')
  })

  it('leaves assistant/tutor titles untouched', async () => {
    const assistant = directConversation({
      id: 'conv-ai',
      type: 'assistant',
      title: 'AI Assistant',
      participantIds: ['user-a'],
    })
    const orchestrator = buildOrchestrator([assistant], [alice, bob])

    const [preview] = await orchestrator.listForUser('user-a')

    expect(preview?.title).toBe('AI Assistant')
  })
})
