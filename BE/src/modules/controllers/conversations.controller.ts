import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { ListConversationsOrchestrator } from '../list-conversations/list-conversations.orchestrator.js'
import { CreateConversationOrchestrator } from '../create-conversation/create-conversation.orchestrator.js'
import { CreateConversationDto } from '../conversations/DTO/create-conversation.dto.js'
import type {
  ConversationCreatedResponse,
  ConversationListResponse,
} from './types/conversation-responses.js'
import type { PublicUser } from '../users/types/user-public-view.js'

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
    const conversation = await this.createConversationOrchestrator.createFromDto(
      currentUser.id,
      createConversationDto,
    )
    return { conversation }
  }
}
