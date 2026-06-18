import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ERROR_CODES } from '../../shared/errors/error-codes.constant.js'
import { ConversationsService } from '../../conversations/conversations.service.js'
import { MessagesService } from '../../messages/messages.service.js'
import { toLastMessageSnapshot } from '../../conversations/conversation.entity.js'
import type { SendMessageDto } from '../../messages/dto/send-message.dto.js'
import type { MessageRecord } from '../../messages/message.entity.js'
import type { AppEnvironment } from '../../config/environment.types.js'

export interface SendMessageInput {
  senderId: string
  conversationId: string
  sendMessageDto: SendMessageDto
  simulateFailureRequested: boolean
}

@Injectable()
export class SendMessageOrchestrator {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  async send({
    senderId,
    conversationId,
    sendMessageDto,
    simulateFailureRequested,
  }: SendMessageInput): Promise<MessageRecord> {
    if (simulateFailureRequested && this.isSimulatedFailureEnabled()) {
      throw new InternalServerErrorException({
        code: ERROR_CODES.SIMULATED_SEND_FAILURE,
        message: 'Simulated send failure',
      })
    }

    const message = await this.messagesService.createMessage({
      senderId,
      conversationId,
      sendMessageDto,
    })

    // Advance the parent conversation's last-activity snapshot. The update is
    // monotonic, so a deduplicated retry of an older message is a no-op.
    await this.conversationsService.advanceLastMessage(
      conversationId,
      toLastMessageSnapshot(message),
    )

    return message
  }

  // Dev-only hook: never honor the simulate-failure header in production.
  private isSimulatedFailureEnabled(): boolean {
    return this.configService.get('NODE_ENV', { infer: true }) !== 'production'
  }
}
