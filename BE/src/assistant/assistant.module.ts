import { Module } from '@nestjs/common'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { KnowledgeModule } from '../knowledge/knowledge.module.js'
import { TUTOR_REPLY_STRATEGY } from '../knowledge/tutor/tutor-reply.strategy.js'
import { ASSISTANT_REPLY_STRATEGY } from './reply-strategy.port.js'
import { REPLY_STRATEGIES, ReplyStrategyRegistry } from './reply-strategy.registry.js'
import { OpenAiAssistantStrategy } from './openai-assistant.strategy.js'
import { ASSISTANT_TOOLS } from './tools/assistant-tool.port.js'
import { AssistantToolRegistry } from './tools/assistant-tool.registry.js'
import { ListMyConversationsTool } from './tools/list-my-conversations.tool.js'
import type { AssistantTool } from './tools/assistant-tool.port.js'
import type { ConversationReplyStrategy } from './reply-strategy.port.js'

// The assistant bounded context: the reply-strategy seam + registry, the scoped tool
// registry, and the LLM-backed strategy. Tests override ASSISTANT_REPLY_STRATEGY with a
// fake so the OpenAI client is never constructed.
@Module({
  imports: [ConversationsModule, KnowledgeModule],
  providers: [
    ListMyConversationsTool,
    {
      provide: ASSISTANT_TOOLS,
      useFactory: (listMyConversations: ListMyConversationsTool): AssistantTool[] => [
        listMyConversations,
      ],
      inject: [ListMyConversationsTool],
    },
    AssistantToolRegistry,
    { provide: ASSISTANT_REPLY_STRATEGY, useClass: OpenAiAssistantStrategy },
    {
      provide: REPLY_STRATEGIES,
      useFactory: (
        assistantStrategy: ConversationReplyStrategy,
        tutorStrategy: ConversationReplyStrategy,
      ): ConversationReplyStrategy[] => [assistantStrategy, tutorStrategy],
      inject: [ASSISTANT_REPLY_STRATEGY, TUTOR_REPLY_STRATEGY],
    },
    ReplyStrategyRegistry,
  ],
  exports: [ReplyStrategyRegistry],
})
export class AssistantModule {}
