import { Body, Controller, Get, Headers, Param, Post, Query, Res, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'
import { CurrentConversation } from './decorator/current-conversation.decorator.js'
import { ListMessagesOrchestrator } from '../list-messages/list-messages.orchestrator.js'
import { SendMessageOrchestrator } from '../send-message/send-message.orchestrator.js'
import { ListMessagesQueryDto } from '../messages/DTO/list-messages-query.dto.js'
import { SendMessageDto } from '../messages/DTO/send-message.dto.js'
import type { Response } from 'express'
import type { ConversationRecord } from '../conversations/types/conversation.entity.js'
import type { MessagePageResponse } from '../messages/types/message-service.types.js'
import type { PublicUser } from '../users/types/user-public-view.js'

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
  sendMessage(
    @CurrentUser() currentUser: PublicUser,
    @CurrentConversation() conversation: ConversationRecord,
    @Body() sendMessageDto: SendMessageDto,
    @Headers('x-simulate-failure') simulateFailureHeader: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    return this.sendMessageOrchestrator.handle(response, {
      senderId: currentUser.id,
      conversation,
      sendMessageDto,
      simulateFailureHeader,
    })
  }
}
