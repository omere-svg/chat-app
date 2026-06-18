import { UnauthorizedException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'
import { CreateConversationOrchestrator } from '../chat/use-cases/create-conversation.orchestrator.js'
import { ConversationParticipantsMapper } from '../chat/mapper/conversation-participants.mapper.js'
import type { ConversationsService } from '../conversations/conversations.service.js'
import type { UsersService } from '../users/users.service.js'
import type { ConversationRecord } from '../conversations/conversation.entity.js'
import type { CreateConversationDto } from '../conversations/dto/create-conversation.dto.js'
import type { PublicUser } from '../users/user-public-view.js'

const creator: PublicUser = { id: 'user-1', email: 'creator@example.com', displayName: 'Creator' }
const invitee: PublicUser = { id: 'user-2', email: 'invitee@example.com', displayName: 'Invitee' }
const createDto = { participantEmails: ['invitee@example.com'] } as CreateConversationDto

function buildOrchestrator(creatorLookup: PublicUser | null): {
  orchestrator: CreateConversationOrchestrator
  create: ReturnType<typeof vi.fn>
} {
  const create = vi.fn().mockImplementation(
    ({ title, participantIds }): Promise<ConversationRecord> =>
      Promise.resolve({
        id: 'conv-1',
        title,
        participantIds,
        lastMessageAt: '2026-01-01T00:00:00.000Z',
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
  it('persists a preview with the creator included among participants', async () => {
    const { orchestrator, create } = buildOrchestrator(creator)

    const preview = await orchestrator.create(creator.id, createDto)

    expect(create).toHaveBeenCalledWith({
      title: 'Creator & Invitee',
      participantIds: ['user-1', 'user-2'],
    })
    expect(preview.participantIds).toEqual(['user-1', 'user-2'])
  })

  it('throws Unauthorized when the authenticated creator cannot be found', async () => {
    const { orchestrator, create } = buildOrchestrator(null)

    await expect(orchestrator.create(creator.id, createDto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
    expect(create).not.toHaveBeenCalled()
  })
})
