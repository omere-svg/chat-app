import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/decorator/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js'
import { ConversationsService } from './conversations.service.js'
import { CreateConversationDto } from './dto/create-conversation.dto.js'
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
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async listConversations(
    @CurrentUser() currentUser: PublicUser,
  ): Promise<ConversationListResponse> {
    const conversations = await this.conversationsService.listConversationsForUser(currentUser.id)
    return { conversations }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @CurrentUser() currentUser: PublicUser,
    @Body() createConversationDto: CreateConversationDto,
  ): Promise<ConversationCreatedResponse> {
    const conversation = await this.conversationsService.createConversation(
      currentUser.id,
      createConversationDto,
    )
    return { conversation }
  }
}
