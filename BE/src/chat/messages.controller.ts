import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '../auth/decorator/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'
import { ListMessagesOrchestrator } from './use-cases/list-messages.orchestrator.js'
import { SendMessageOrchestrator } from './use-cases/send-message.orchestrator.js'
import { ListMessagesQueryDto } from '../messages/dto/list-messages-query.dto.js'
import { SendMessageDto } from '../messages/dto/send-message.dto.js'
import type { MessagePageResponse } from '../messages/messages.service.js'
import type { MessageRecord } from '../messages/message.entity.js'
import type { PublicUser } from '../users/user-public-view.js'

const SIMULATE_FAILURE_HEADER_VALUE = '1'

interface MessageCreatedResponse {
  message: MessageRecord
}

@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard, ConversationParticipantGuard)
export class MessagesController {
  constructor(
    private readonly listMessagesOrchestrator: ListMessagesOrchestrator,
    private readonly sendMessageOrchestrator: SendMessageOrchestrator,
  ) {}

  @Get()
  listMessages(
    @Param('conversationId') conversationId: string,
    @Query() listMessagesQuery: ListMessagesQueryDto,
  ): Promise<MessagePageResponse> {
    return this.listMessagesOrchestrator.list(conversationId, listMessagesQuery)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() currentUser: PublicUser,
    @Param('conversationId') conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Headers('x-simulate-failure') simulateFailureHeader: string | undefined,
  ): Promise<MessageCreatedResponse> {
    const message = await this.sendMessageOrchestrator.send({
      senderId: currentUser.id,
      conversationId,
      sendMessageDto,
      simulateFailureRequested: simulateFailureHeader === SIMULATE_FAILURE_HEADER_VALUE,
    })
    return { message }
  }
}
