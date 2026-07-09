import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { MessagesService } from '../../messages/messages.service.js'
import type { AssistantTool, AssistantToolContext, AssistantToolDefinition } from './assistant-tool.port.js'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 25
const MAX_SNIPPET_LENGTH = 200

// Model-facing input only. The user id is NEVER part of this schema — it is injected
// from the authenticated request so the model can't read another user's messages.
const inputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(200)
    .describe('Text to search for within the signed-in user\'s own messages.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .optional()
    .describe('Maximum number of matching messages to return (most recent first).'),
})

interface MessageSearchHit {
  conversationId: string
  snippet: string
  createdAt: string
}

@Injectable()
export class SearchMyMessagesTool implements AssistantTool {
  constructor(private readonly messagesService: MessagesService) {}

  readonly definition: AssistantToolDefinition = {
    name: 'search_my_messages',
    description:
      "Search the signed-in user's own messages by keyword, most recent first. Use this " +
      'when the user asks what they said about something, or to find one of their past messages.',
    parameters: z.toJSONSchema(inputSchema),
  }

  async execute(rawInput: unknown, context: AssistantToolContext): Promise<MessageSearchHit[]> {
    const { query, limit } = inputSchema.parse(rawInput)
    const messages = await this.messagesService.searchMessagesAuthoredByUser(
      context.userId,
      query,
      limit ?? DEFAULT_LIMIT,
    )
    return messages.map((message) => ({
      conversationId: message.conversationId,
      snippet: message.body.slice(0, MAX_SNIPPET_LENGTH),
      createdAt: message.createdAt,
    }))
  }
}
