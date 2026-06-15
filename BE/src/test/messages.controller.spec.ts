import { InternalServerErrorException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'
import { MessagesController } from '../chat/messages.controller.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../config/environment.types.js'
import type { MessageRecord } from '../messages/message.entity.js'
import type { MessagesService } from '../messages/messages.service.js'
import type { SendMessageDto } from '../messages/dto/send-message.dto.js'
import type { PublicUser } from '../users/user-public-view.js'

const currentUser: PublicUser = { id: 'user-1', email: 'a@example.com', displayName: 'A' }
const sendMessageDto = { body: 'hello' } as SendMessageDto
const createdMessage: MessageRecord = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'user-1',
  body: 'hello',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function buildController(nodeEnv: AppEnvironment['NODE_ENV']): {
  controller: MessagesController
  createMessage: ReturnType<typeof vi.fn>
} {
  const createMessage = vi.fn().mockResolvedValue(createdMessage)
  const messagesService = { createMessage } as unknown as MessagesService
  const configService = {
    get: vi.fn().mockReturnValue(nodeEnv),
  } as unknown as ConfigService<AppEnvironment, true>

  return { controller: new MessagesController(messagesService, configService), createMessage }
}

describe('MessagesController simulate-failure gating', () => {
  it('honors the simulate-failure header outside production', async () => {
    const { controller, createMessage } = buildController('development')

    await expect(
      controller.sendMessage(currentUser, 'conv-1', sendMessageDto, '1'),
    ).rejects.toBeInstanceOf(InternalServerErrorException)
    expect(createMessage).not.toHaveBeenCalled()
  })

  it('ignores the simulate-failure header in production', async () => {
    const { controller, createMessage } = buildController('production')

    const result = await controller.sendMessage(currentUser, 'conv-1', sendMessageDto, '1')

    expect(result.message).toEqual(createdMessage)
    expect(createMessage).toHaveBeenCalledOnce()
  })
})
