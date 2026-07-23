import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SimulatedSendFailureError } from './errors/simulated-send-failure.error.js'
import { ConversationsService } from '../conversations/conversations.service.js'
import { MessagesService } from '../messages/messages.service.js'
import { StreamAssistantReplyOrchestrator } from '../stream-assistant-reply/stream-assistant-reply.orchestrator.js'
import { toLastMessageSnapshot } from '../conversations/conversation.mapper.js'
import { isAssistantReplyType } from '../conversations/conversation-type.helper.js'
import { SIMULATE_FAILURE_HEADER_VALUE } from './constants.js'
import type { Response } from 'express'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { MessageRecord } from '../messages/types/message.entity.js'
import type { SendMessageRequestInput, SendMessageInput } from './types/send-message-input.js'

@Injectable()
export class SendMessageOrchestrator {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly streamAssistantReplyOrchestrator: StreamAssistantReplyOrchestrator,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  async sendMessageToResponse(
    response: Response,
    { senderId, conversation, sendMessageDto, simulateFailureHeader }: SendMessageRequestInput,
  ): Promise<void> {
    if (isAssistantReplyType(conversation.type)) {
      await this.streamAssistantReplyOrchestrator.streamToResponse(response, {
        userId: senderId,
        conversation,
        sendMessageDto,
      })
      return
    }

    const message = await this.send({
      senderId,
      conversationId: conversation.id,
      sendMessageDto,
      simulateFailureRequested: simulateFailureHeader === SIMULATE_FAILURE_HEADER_VALUE,
    })
    response.status(HttpStatus.CREATED).json({ message })
  }

  async send({
    senderId,
    conversationId,
    sendMessageDto,
    simulateFailureRequested,
  }: SendMessageInput): Promise<MessageRecord> {
    if (simulateFailureRequested && this.isSimulatedFailureEnabled()) {
      throw new SimulatedSendFailureError()
    }

    const message = await this.messagesService.createMessage({
      senderId,
      conversationId,
      body: sendMessageDto.body,
      clientMessageId: sendMessageDto.clientMessageId,
    })

    await this.conversationsService.advanceLastMessageIfNewer(
      conversationId,
      toLastMessageSnapshot(message),
    )

    return message
  }

  private isSimulatedFailureEnabled(): boolean {
    return this.configService.get('NODE_ENV', { infer: true }) !== 'production'
  }
}
