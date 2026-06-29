import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/decorator/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js'
import { ListConversationsOrchestrator } from './use-cases/list-conversations.orchestrator.js'
import { CreateConversationOrchestrator } from './use-cases/create-conversation.orchestrator.js'
import { CreateConversationDto } from '../conversations/dto/create-conversation.dto.js'
import type { ConversationPreview } from './conversation-preview-view.js'
import type { PublicUser } from '../users/user-public-view.js'

interface ConversationListResponse {
  conversations: ConversationPreview[]
}

interface ConversationCreatedResponse {
  conversation: ConversationPreview
}

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    private readonly listConversationsOrchestrator: ListConversationsOrchestrator,
    private readonly createConversationOrchestrator: CreateConversationOrchestrator,
  ) {}

  @Get()
  async listConversations(
    @CurrentUser() currentUser: PublicUser,
  ): Promise<ConversationListResponse> {
    const conversations = await this.listConversationsOrchestrator.listForUser(currentUser.id)
    return { conversations }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @CurrentUser() currentUser: PublicUser,
    @Body() createConversationDto: CreateConversationDto,
  ): Promise<ConversationCreatedResponse> {
    const conversation = await this.createConversationFor(currentUser.id, createConversationDto)
    return { conversation }
  }

  private createConversationFor(
    creatorUserId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<ConversationPreview> {
    switch (createConversationDto.type) {
      case 'assistant':
        return this.createConversationOrchestrator.createAssistant(
          creatorUserId,
          createConversationDto.title,
        )
      case 'tutor':
        return this.createConversationOrchestrator.createTutor(
          creatorUserId,
          createConversationDto.title,
        )
      default:
        return this.createConversationOrchestrator.create(creatorUserId, createConversationDto)
    }
  }
}
