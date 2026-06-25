import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '../auth/decorator/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'
import { CurrentConversation } from './decorator/current-conversation.decorator.js'
import { ListMessagesOrchestrator } from './use-cases/list-messages.orchestrator.js'
import { SendMessageOrchestrator } from './use-cases/send-message.orchestrator.js'
import { StreamAssistantReplyOrchestrator } from './use-cases/stream-assistant-reply.orchestrator.js'
import { serializeAssistantStreamEvent } from '../assistant/assistant-stream-event.js'
import { ListMessagesQueryDto } from '../messages/dto/list-messages-query.dto.js'
import { SendMessageDto } from '../messages/dto/send-message.dto.js'
import type { Response } from 'express'
import type { AssistantStreamEvent } from '../assistant/assistant-stream-event.js'
import type { ConversationRecord } from '../conversations/conversation.entity.js'
import type { MessagePageResponse } from '../messages/messages.service.js'
import type { PublicUser } from '../users/user-public-view.js'

const SIMULATE_FAILURE_HEADER_VALUE = '1'

@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard, ConversationParticipantGuard)
export class MessagesController {
  constructor(
    private readonly listMessagesOrchestrator: ListMessagesOrchestrator,
    private readonly sendMessageOrchestrator: SendMessageOrchestrator,
    private readonly streamAssistantReplyOrchestrator: StreamAssistantReplyOrchestrator,
  ) {}

  @Get()
  listMessages(
    @Param('conversationId') conversationId: string,
    @Query() listMessagesQuery: ListMessagesQueryDto,
  ): Promise<MessagePageResponse> {
    return this.listMessagesOrchestrator.list(conversationId, listMessagesQuery)
  }

  // Both paths share this route. Validation and the participant guard run first, so
  // pre-stream failures are ordinary JSON + status. An assistant conversation switches
  // the response to SSE; once streaming starts, failures are SSE `error` events.
  @Post()
  async sendMessage(
    @CurrentUser() currentUser: PublicUser,
    @CurrentConversation() conversation: ConversationRecord,
    @Body() sendMessageDto: SendMessageDto,
    @Headers('x-simulate-failure') simulateFailureHeader: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    if (conversation.type === 'assistant') {
      await this.streamAssistantReply(currentUser, conversation, sendMessageDto, response)
      return
    }

    const message = await this.sendMessageOrchestrator.send({
      senderId: currentUser.id,
      conversationId: conversation.id,
      sendMessageDto,
      simulateFailureRequested: simulateFailureHeader === SIMULATE_FAILURE_HEADER_VALUE,
    })
    response.status(HttpStatus.CREATED).json({ message })
  }

  private async streamAssistantReply(
    currentUser: PublicUser,
    conversation: ConversationRecord,
    sendMessageDto: SendMessageDto,
    response: Response,
  ): Promise<void> {
    response.writeHead(HttpStatus.OK, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Disable proxy buffering so tokens flush to the client immediately.
      'X-Accel-Buffering': 'no',
    })
    response.flushHeaders()

    // Client disconnect cancels in-flight LLM work via this signal.
    const abortController = new AbortController()
    response.on('close', () => abortController.abort())

    const emit = (event: AssistantStreamEvent): void => {
      if (!response.writableEnded) {
        response.write(serializeAssistantStreamEvent(event))
      }
    }

    await this.streamAssistantReplyOrchestrator.stream({
      userId: currentUser.id,
      conversation,
      sendMessageDto,
      signal: abortController.signal,
      emit,
    })

    if (!response.writableEnded) {
      response.end()
    }
  }
}
