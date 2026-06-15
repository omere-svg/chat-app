import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CurrentUser } from '../auth/decorator/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'
import { ListMessagesQueryDto } from '../messages/dto/list-messages-query.dto.js'
import { MessagesService } from '../messages/messages.service.js'
import { SendMessageDto } from '../messages/dto/send-message.dto.js'
import type { MessagePageResponse } from '../messages/messages.service.js'
import type { MessageRecord } from '../messages/message.entity.js'
import type { AppEnvironment } from '../config/environment.types.js'
import type { PublicUser } from '../users/user-public-view.js'

const SIMULATE_FAILURE_HEADER_VALUE = '1'

interface MessageCreatedResponse {
  message: MessageRecord
}

@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard, ConversationParticipantGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  @Get()
  listMessages(
    @Param('conversationId') conversationId: string,
    @Query() listMessagesQuery: ListMessagesQueryDto,
  ): Promise<MessagePageResponse> {
    return this.messagesService.listMessages(conversationId, listMessagesQuery)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() currentUser: PublicUser,
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Headers('x-simulate-failure') simulateFailureHeader: string | undefined,
  ): Promise<MessageCreatedResponse> {
    if (this.isSimulatedFailureEnabled() && simulateFailureHeader === SIMULATE_FAILURE_HEADER_VALUE) {
      throw new InternalServerErrorException({
        code: ERROR_CODES.SIMULATED_SEND_FAILURE,
        message: 'Simulated send failure',
      })
    }

    const message = await this.messagesService.createMessage({
      senderId: currentUser.id,
      conversationId,
      sendMessageDto,
    })
    return { message }
  }

  // Dev-only hook: never honor the simulate-failure header in production.
  private isSimulatedFailureEnabled(): boolean {
    return this.configService.get('NODE_ENV', { infer: true }) !== 'production'
  }
}
