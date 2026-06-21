import { InternalServerErrorException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'
import { SendMessageOrchestrator } from '../chat/use-cases/send-message.orchestrator.js'
import type { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../config/environment.types.js'
import type { ConversationsService } from '../conversations/conversations.service.js'
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
  advanceLastMessageIfNewer: ReturnType<typeof vi.fn>
} {
  const createMessage = vi.fn().mockResolvedValue(createdMessage)
  const advanceLastMessageIfNewer = vi.fn().mockResolvedValue(undefined)
  const messagesService = { createMessage } as unknown as MessagesService
  const conversationsService = { advanceLastMessageIfNewer } as unknown as ConversationsService
  const configService = {
    get: vi.fn().mockReturnValue(nodeEnv),
  } as unknown as ConfigService<AppEnvironment, true>

  return {
    orchestrator: new SendMessageOrchestrator(messagesService, conversationsService, configService),
    createMessage,
    advanceLastMessageIfNewer,
  }
}

describe('SendMessageOrchestrator', () => {
  it('honors the simulate-failure header outside production and writes nothing', async () => {
    const { orchestrator, createMessage, advanceLastMessageIfNewer } = buildOrchestrator('development')

    await expect(
      orchestrator.send({
        senderId: 'user-1',
        conversationId: 'conv-1',
        sendMessageDto,
        simulateFailureRequested: true,
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException)
    expect(createMessage).not.toHaveBeenCalled()
    expect(advanceLastMessageIfNewer).not.toHaveBeenCalled()
  })

  it('ignores the simulate-failure header in production', async () => {
    const { orchestrator, createMessage } = buildOrchestrator('production')

    const result = await orchestrator.send({
      senderId: 'user-1',
      conversationId: 'conv-1',
      sendMessageDto,
      simulateFailureRequested: true,
    })

    expect(result).toEqual(createdMessage)
    expect(createMessage).toHaveBeenCalledOnce()
  })

  it('advances the conversation snapshot after persisting the message', async () => {
    const { orchestrator, advanceLastMessageIfNewer } = buildOrchestrator('development')

    await orchestrator.send({
      senderId: 'user-1',
      conversationId: 'conv-1',
      sendMessageDto,
      simulateFailureRequested: false,
    })

    expect(advanceLastMessageIfNewer).toHaveBeenCalledWith('conv-1', {
      body: createdMessage.body,
      senderId: createdMessage.senderId,
      createdAt: createdMessage.createdAt,
    })
  })
})
