import { Injectable, Logger } from '@nestjs/common'
import { ERROR_CODES } from '../../shared/errors/error-codes.constant.js'
import { ConversationsService } from '../../conversations/conversations.service.js'
import { MessagesService } from '../../messages/messages.service.js'
import { ReplyStrategyRegistry } from '../../assistant/reply-strategy.registry.js'
import { toLastMessageSnapshot } from '../../conversations/conversation.entity.js'
import { deriveConversationTitleFromMessage } from '../../conversations/derive-conversation-title.js'
import type { ConversationRecord } from '../../conversations/conversation.entity.js'
import type { AssistantStreamEvent } from '../../assistant/assistant-stream-event.js'
import type { AssistantTurnMessage } from '../../assistant/reply-strategy.port.js'
import type { MessageCitation, MessageRecord } from '../../messages/message.entity.js'
import type { SendMessageDto } from '../../messages/dto/send-message.dto.js'

const HISTORY_LIMIT = 20

export interface StreamAssistantReplyInput {
  userId: string
  conversation: ConversationRecord
  sendMessageDto: SendMessageDto
  // Aborted when the client disconnects.
  signal: AbortSignal
  // Sink for SSE events. Must tolerate being called after the client has gone.
  emit: (event: AssistantStreamEvent) => void
}

@Injectable()
export class StreamAssistantReplyOrchestrator {
  private readonly logger = new Logger(StreamAssistantReplyOrchestrator.name)

  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly replyStrategyRegistry: ReplyStrategyRegistry,
  ) {}

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
        sendMessageDto,
      })
      // Name the chat from this message while it still carries the default title, so a
      // brand-new chat (and any still-unnamed one) gets a meaningful title. A no-op once
      // it has been renamed.
      await this.conversationsService.setTitleIfStillDefault(
        conversation.id,
        deriveConversationTitleFromMessage(userMessage.body),
      )
      // Reflect the user's message in the conversation preview right away, so the list
      // stays correct even if reply generation later fails or the client disconnects.
      await this.conversationsService.advanceLastMessageIfNewer(
        conversation.id,
        toLastMessageSnapshot(userMessage),
      )
    } catch (error) {
      this.logAndEmitFailure(emit, error, 'persisting the user message')
      return
    }

    emit({ event: 'user_message', data: { message: userMessage } })

    // Idempotent replay: a retried send (same clientMessageId) returns the same user
    // message; if its reply was already persisted, replay it instead of calling the LLM.
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
          case 'citations':
            citations = chunk.citations
            emit({ event: 'citations', data: { citations } })
            break
        }
      }
    } catch (error) {
      // A client disconnect aborts the upstream call; that's expected, not a failure —
      // stay silent and persist nothing.
      if (signal.aborted) {
        return
      }
      this.logAndEmitFailure(emit, error, 'generating the assistant reply')
      return
    }

    // Client left mid-stream: persist nothing; the user message stands and a resend
    // regenerates (no reply was linked).
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
        // Only tutor replies carry citations; omit the field entirely otherwise so the
        // plain assistant reply shape is unchanged.
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
  ): Promise<AssistantTurnMessage[]> {
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
