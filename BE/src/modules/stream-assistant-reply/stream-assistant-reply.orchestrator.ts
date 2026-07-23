import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ERROR_CODES } from '../../shared/errors/error-codes.constants.js'
import { ConversationsService } from '../conversations/conversations.service.js'
import { MessagesService } from '../messages/messages.service.js'
import { ReplyStrategyRegistry } from '../agent/reply-strategy.registry.js'
import { toLastMessageSnapshot } from '../conversations/conversation.mapper.js'
import { deriveConversationTitleFromMessage } from '../conversations/derive-conversation-title.js'
import { serializeAssistantStreamEvent } from './assistant-stream-event.serializer.js'
import { HISTORY_LIMIT, SSE_RESPONSE_HEADERS } from './constants.js'
import type { Response } from 'express'
import type { AgentTurnMessage } from '../agent/types/reply-strategy.js'
import type { MessageCitation, MessageRecord } from '../messages/types/message.entity.js'
import type { AssistantStreamEvent } from './types/assistant-stream-event.js'
import type {
  StreamAssistantReplyInput,
  StreamAssistantReplyToResponseInput,
} from './types/stream-assistant-reply-input.js'

@Injectable()
export class StreamAssistantReplyOrchestrator {
  private readonly logger = new Logger(StreamAssistantReplyOrchestrator.name)

  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly replyStrategyRegistry: ReplyStrategyRegistry,
  ) {}

  async streamToResponse(
    response: Response,
    { userId, conversation, sendMessageDto }: StreamAssistantReplyToResponseInput,
  ): Promise<void> {
    response.writeHead(HttpStatus.OK, { ...SSE_RESPONSE_HEADERS })
    response.flushHeaders()

    const abortController = new AbortController()
    response.on('close', () => abortController.abort())

    const emit = (event: AssistantStreamEvent): void => {
      if (!response.writableEnded) {
        response.write(serializeAssistantStreamEvent(event))
      }
    }

    await this.stream({
      userId,
      conversation,
      sendMessageDto,
      signal: abortController.signal,
      emit,
    })

    if (!response.writableEnded) {
      response.end()
    }
  }

  async stream({
    userId,
    conversation,
    sendMessageDto,
    signal,
    emit,
  }: StreamAssistantReplyInput): Promise<void> {
    let userMessage: MessageRecord
    try {
      userMessage = await this.messagesService.createMessage({
        senderId: userId,
        conversationId: conversation.id,
        body: sendMessageDto.body,
        clientMessageId: sendMessageDto.clientMessageId,
      })
      await this.conversationsService.setTitleIfStillDefault(
        conversation.id,
        deriveConversationTitleFromMessage(userMessage.body),
      )
      await this.conversationsService.advanceLastMessageIfNewer(
        conversation.id,
        toLastMessageSnapshot(userMessage),
      )
    } catch (error) {
      this.logAndEmitFailure(emit, error, 'persisting the user message')
      return
    }

    emit({ event: 'user_message', data: { message: userMessage } })

    const existingReply = await this.messagesService.findAssistantReplyTo(
      conversation.id,
      userMessage.id,
    )
    if (existingReply !== null) {
      emit({ event: 'done', data: { message: existingReply } })
      return
    }

    const history = await this.buildHistory(conversation.id, userId)
    const strategy = this.replyStrategyRegistry.resolve(conversation.type)

    let replyText = ''
    let citations: MessageCitation[] = []
    try {
      for await (const chunk of strategy.generate({
        userId,
        conversationId: conversation.id,
        history,
        signal,
      })) {
        switch (chunk.type) {
          case 'text-delta':
            replyText += chunk.text
            emit({ event: 'token', data: { text: chunk.text } })
            break
          case 'tool-invoked':
            emit({ event: 'tool', data: { name: chunk.name } })
            break
          case 'tool-result':
            emit({ event: 'tool_result', data: { name: chunk.name } })
            break
          case 'citations':
            citations = chunk.citations
            emit({ event: 'citations', data: { citations } })
            break
        }
      }
    } catch (error) {
      if (signal.aborted) {
        return
      }
      this.logAndEmitFailure(emit, error, 'generating the assistant reply')
      return
    }

    if (signal.aborted) {
      return
    }

    const trimmedReply = replyText.trim()
    if (trimmedReply.length === 0) {
      this.logAndEmitFailure(
        emit,
        new Error('assistant produced an empty reply'),
        'generating the assistant reply',
      )
      return
    }

    let assistantReply: MessageRecord
    try {
      assistantReply = await this.messagesService.createAssistantReply({
        conversationId: conversation.id,
        body: trimmedReply,
        replyToMessageId: userMessage.id,
        ...(citations.length > 0 ? { citations } : {}),
      })
      await this.conversationsService.advanceLastMessageIfNewer(
        conversation.id,
        toLastMessageSnapshot(assistantReply),
      )
    } catch (error) {
      this.logAndEmitFailure(emit, error, 'persisting the assistant reply')
      return
    }

    emit({ event: 'done', data: { message: assistantReply } })
  }

  private async buildHistory(
    conversationId: string,
    userId: string,
  ): Promise<AgentTurnMessage[]> {
    const recentMessages = await this.messagesService.listRecentMessagesOldestFirst(
      conversationId,
      HISTORY_LIMIT,
    )
    return recentMessages.map((message) => ({
      role: message.senderId === userId ? 'user' : 'assistant',
      content: message.body,
    }))
  }

  private logAndEmitFailure(
    emit: (event: AssistantStreamEvent) => void,
    error: unknown,
    whileDoing: string,
  ): void {
    this.logger.error(
      `Assistant reply failed while ${whileDoing}`,
      error instanceof Error ? error.stack : String(error),
    )
    emit({
      event: 'error',
      data: {
        code: ERROR_CODES.ASSISTANT_UNAVAILABLE,
        message: 'The assistant is currently unavailable. Please try again.',
      },
    })
  }
}
