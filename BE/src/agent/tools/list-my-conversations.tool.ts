import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { ConversationsService } from '../../conversations/conversations.service.js'
import type { ConversationType } from '../../conversations/conversation.entity.js'
import type { AgentTool, AgentToolContext, AgentToolDefinition } from './agent-tool.port.js'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50
const MAX_SNIPPET_LENGTH = 200

// Model-facing input only. The user id is NEVER part of this schema — it is injected
// from the authenticated request so the model can't read another user's data.
const inputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .optional()
    .describe('Maximum number of conversations to return (most recently active first).'),
})

interface ConversationToolView {
  id: string
  type: ConversationType
  title: string
  updatedAt: string
  lastMessageSnippet: string | null
}

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
    return conversations.slice(0, limit ?? DEFAULT_LIMIT).map(toConversationToolView)
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
        : conversation.lastMessage.body.slice(0, MAX_SNIPPET_LENGTH),
  }
}
