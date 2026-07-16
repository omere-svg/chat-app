import { describe, expect, it, vi } from 'vitest'
import { ListConversationsOrchestrator } from '../chat/use-cases/list-conversations.orchestrator.js'
import { ConversationParticipantsMapper } from '../chat/mapper/conversation-participants.mapper.js'
import type { ConversationsService } from '../conversations/conversations.service.js'
import type { UsersService } from '../users/users.service.js'
import type { ConversationRecord } from '../conversations/conversation.entity.js'
import type { PublicUser } from '../users/user-public-view.js'

const alice: PublicUser = { id: 'user-a', email: 'a@example.com', firstName: 'Alice', lastName: 'Adams' }
const bob: PublicUser = { id: 'user-b', email: 'b@example.com', firstName: 'Bob', lastName: 'Brown' }

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
  knownUsers: PublicUser[],
): ListConversationsOrchestrator {
  const conversationsService = {
    listForParticipant: vi.fn().mockResolvedValue(conversations),
  } as unknown as ConversationsService
  const usersService = {
    findPublicUsersByIds: vi.fn().mockResolvedValue(knownUsers),
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

    // The stored "Stale Snapshot" title is replaced by the live participant names.
    expect(preview?.title).toBe('Alice Adams & Bob Brown')
  })

  it('reflects a renamed participant', async () => {
    const renamedBob: PublicUser = { ...bob, firstName: 'Robert', lastName: 'Brown' }
    const orchestrator = buildOrchestrator([directConversation()], [alice, renamedBob])

    const [preview] = await orchestrator.listForUser('user-a')

    expect(preview?.title).toBe('Alice Adams & Robert Brown')
  })

  it('keeps the stored title when a participant cannot be resolved', async () => {
    // Only one of the two participants is returned (e.g. a deleted account).
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
