import { describe, expect, it, vi } from 'vitest'
import { CreateConversationOrchestrator } from '../create-conversation.orchestrator.js'
import { CreatorNotFoundError } from '../errors/creator-not-found.error.js'
import { ConversationParticipantsMapper } from '../../../shared/conversation-participants/conversation-participants.mapper.js'
import type { ConversationsService } from '../../conversations/conversations.service.js'
import type { UsersService } from '../../users/users.service.js'
import type { ConversationRecord } from '../../conversations/types/conversation.entity.js'
import type { CreateConversationDto } from '../../conversations/DTO/create-conversation.dto.js'
import type { PublicUser } from '../../users/types/user-public-view.js'

const creator: PublicUser = { id: 'user-1', email: 'creator@example.com', firstName: 'Creator', lastName: 'One' }
const invitee: PublicUser = { id: 'user-2', email: 'invitee@example.com', firstName: 'Invitee', lastName: 'Two' }
const createDto = { participantEmails: ['invitee@example.com'] } as CreateConversationDto

function buildOrchestrator(creatorLookup: PublicUser | null): {
  orchestrator: CreateConversationOrchestrator
  create: ReturnType<typeof vi.fn>
} {
  const create = vi.fn().mockImplementation(
    ({ type, title, participantIds }): Promise<ConversationRecord> =>
      Promise.resolve({
        id: 'conv-1',
        type: type ?? 'direct',
        title,
        participantIds,
        lastActivityAt: '2026-01-01T00:00:00.000Z',
        lastMessage: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
  )
  const conversationsService = { create } as unknown as ConversationsService
  const usersService = {
    resolveExistingUsersByEmails: vi.fn().mockResolvedValue([invitee]),
    findPublicUserById: vi.fn().mockResolvedValue(creatorLookup),
  } as unknown as UsersService

  return {
    orchestrator: new CreateConversationOrchestrator(
      conversationsService,
      usersService,
      new ConversationParticipantsMapper(),
    ),
    create,
  }
}

describe('CreateConversationOrchestrator', () => {
  it('persists a direct preview with the creator included among participants', async () => {
    const { orchestrator, create } = buildOrchestrator(creator)

    const preview = await orchestrator.create(creator.id, createDto)

    expect(create).toHaveBeenCalledWith({
      type: 'direct',
      title: 'Creator One & Invitee Two',
      participantIds: ['user-1', 'user-2'],
    })
    expect(preview.participantIds).toEqual(['user-1', 'user-2'])
  })

  it('throws Unauthorized when the authenticated creator cannot be found', async () => {
    const { orchestrator, create } = buildOrchestrator(null)

    await expect(orchestrator.create(creator.id, createDto)).rejects.toBeInstanceOf(
      CreatorNotFoundError,
    )
    expect(create).not.toHaveBeenCalled()
  })

  it('creates an assistant conversation with the creator as sole participant and a default title', async () => {
    const { orchestrator, create } = buildOrchestrator(creator)

    const preview = await orchestrator.createAssistant(creator.id, undefined)

    expect(create).toHaveBeenCalledWith({
      type: 'assistant',
      title: 'AI Assistant',
      participantIds: ['user-1'],
    })
    expect(preview.type).toBe('assistant')
    expect(preview.participantIds).toEqual(['user-1'])
  })

  it('honors a custom assistant-conversation title when provided', async () => {
    const { orchestrator, create } = buildOrchestrator(creator)

    await orchestrator.createAssistant(creator.id, '  Planning bot  ')

    expect(create).toHaveBeenCalledWith({
      type: 'assistant',
      title: 'Planning bot',
      participantIds: ['user-1'],
    })
  })
})
