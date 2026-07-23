import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { MessagesService } from '../../../modules/messages/messages.service.js'
import {
  SEARCH_MESSAGES_DEFAULT_LIMIT,
  SEARCH_MESSAGES_MAX_LIMIT,
  SEARCH_MESSAGES_QUERY_MAX_LENGTH,
} from './constants.js'
import { SEARCH_MY_MESSAGES_TOOL } from '../constants.js'
import { toMessageSearchHit } from './message-search-hit.mapper.js'
import type { AgentTool, AgentToolContext, AgentToolDefinition } from '../types/agent-tool.js'
import type { MessageSearchHit } from '../types/message-search-hit.js'

const inputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(SEARCH_MESSAGES_QUERY_MAX_LENGTH)
    .describe('Text to search for within the signed-in user\'s own messages.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(SEARCH_MESSAGES_MAX_LIMIT)
    .optional()
    .describe('Maximum number of matching messages to return (most recent first).'),
})

@Injectable()
export class SearchMyMessagesTool implements AgentTool {
  constructor(private readonly messagesService: MessagesService) {}

  readonly definition: AgentToolDefinition = {
    name: SEARCH_MY_MESSAGES_TOOL,
    description:
      "Search the signed-in user's own messages by keyword, most recent first. Use this " +
      'when the user asks what they said about something, or to find one of their past messages.',
    parameters: z.toJSONSchema(inputSchema),
  }

  async execute(rawInput: unknown, context: AgentToolContext): Promise<MessageSearchHit[]> {
    const { query, limit } = inputSchema.parse(rawInput)
    const messages = await this.messagesService.searchMessagesAuthoredByUser(
      context.userId,
      query,
      limit ?? SEARCH_MESSAGES_DEFAULT_LIMIT,
    )
    return messages.map(toMessageSearchHit)
  }
}
