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
import { CurrentUser } from '../auth/decorator/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'
import { ListMessagesQueryDto } from './dto/list-messages-query.dto.js'
import { MessagesService } from './messages.service.js'
import { SendMessageDto } from './dto/send-message.dto.js'
import type { MessagePageResponse } from './messages.service.js'
import type { MessageRecord } from './message.entity.js'
import type { PublicUser } from '../users/user-public-view.js'

const SIMULATE_FAILURE_HEADER_VALUE = '1'

interface MessageCreatedResponse {
  message: MessageRecord
}

@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard, ConversationParticipantGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

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
    if (simulateFailureHeader === SIMULATE_FAILURE_HEADER_VALUE) {
      throw new InternalServerErrorException({
        code: ERROR_CODES.SIMULATED_SEND_FAILURE,
        message: 'Simulated send failure',
      })
    }

    const message = await this.messagesService.createMessage(
      currentUser.id,
      conversationId,
      sendMessageDto,
    )
    return { message }
  }
}
