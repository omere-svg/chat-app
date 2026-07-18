import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { ConversationsService } from '../../../modules/conversations/conversations.service.js'
import {
  LIST_CONVERSATIONS_DEFAULT_LIMIT,
  LIST_CONVERSATIONS_MAX_LIMIT,
  TOOL_SNIPPET_MAX_LENGTH,
} from './constants.js'
import type { ConversationType } from '../../../modules/conversations/types/conversation.entity.js'
import type { AgentTool, AgentToolContext, AgentToolDefinition } from '../types/agent-tool.js'
import type { ConversationToolView } from '../types/conversation-tool-view.js'

const inputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(LIST_CONVERSATIONS_MAX_LIMIT)
    .optional()
    .describe('Maximum number of conversations to return (most recently active first).'),
})

@Injectable()
export class ListMyConversationsTool implements AgentTool {
  constructor(private readonly conversationsService: ConversationsService) {}

  readonly definition: AgentToolDefinition = {
    name: 'list_my_conversations',
    description:
      "List the signed-in user's own conversations, most recently active first. " +
      'Use this when the user asks about their chats, who they last spoke with, or recent activity.',
    parameters: z.toJSONSchema(inputSchema),
  }

  async execute(rawInput: unknown, context: AgentToolContext): Promise<ConversationToolView[]> {
    const { limit } = inputSchema.parse(rawInput)
    const conversations = await this.conversationsService.listForParticipant(context.userId)
    return conversations.slice(0, limit ?? LIST_CONVERSATIONS_DEFAULT_LIMIT).map(toConversationToolView)
  }
}

function toConversationToolView(conversation: {
  id: string
  type: ConversationType
  title: string
  lastActivityAt: string
  lastMessage: { body: string } | null
}): ConversationToolView {
  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    updatedAt: conversation.lastActivityAt,
    lastMessageSnippet:
      conversation.lastMessage === null
        ? null
        : conversation.lastMessage.body.slice(0, TOOL_SNIPPET_MAX_LENGTH),
  }
}
