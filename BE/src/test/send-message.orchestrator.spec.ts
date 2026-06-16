import { InternalServerErrorException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'
import { SendMessageOrchestrator } from '../chat/use-cases/send-message.orchestrator.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../config/environment.types.js'
import type { MessageRecord } from '../messages/message.entity.js'
import type { MessagesService } from '../messages/messages.service.js'
import type { SendMessageDto } from '../messages/dto/send-message.dto.js'

const sendMessageDto = { body: 'hello' } as SendMessageDto
const createdMessage: MessageRecord = {
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'user-1',
  body: 'hello',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function buildOrchestrator(nodeEnv: AppEnvironment['NODE_ENV']): {
  orchestrator: SendMessageOrchestrator
  createMessage: ReturnType<typeof vi.fn>
} {
  const createMessage = vi.fn().mockResolvedValue(createdMessage)
  const messagesService = { createMessage } as unknown as MessagesService
  const configService = {
    get: vi.fn().mockReturnValue(nodeEnv),
  } as unknown as ConfigService<AppEnvironment, true>

  return {
    orchestrator: new SendMessageOrchestrator(messagesService, configService),
    createMessage,
  }
}

describe('SendMessageOrchestrator simulate-failure gating', () => {
  it('honors the simulate-failure header outside production', async () => {
    const { orchestrator, createMessage } = buildOrchestrator('development')

    await expect(
      orchestrator.send({
        senderId: 'user-1',
        conversationId: 'conv-1',
        sendMessageDto,
        simulateFailureRequested: true,
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException)
    expect(createMessage).not.toHaveBeenCalled()
  })

  it('ignores the simulate-failure header in production', async () => {
    const { orchestrator, createMessage } = buildOrchestrator('production')

    const result = await orchestrator.send({
      senderId: 'user-1',
      conversationId: 'conv-1',
      sendMessageDto,
      simulateFailureHeader: '1',
    })

    expect(result).toEqual(createdMessage)
    expect(createMessage).toHaveBeenCalledOnce()
  })
})
