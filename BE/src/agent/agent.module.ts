import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getConnectionToken } from '@nestjs/mongoose'
import { ChatOpenAI } from '@langchain/openai'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { MessagesModule } from '../messages/messages.module.js'
import { KnowledgeModule } from '../knowledge/knowledge.module.js'
import { EMBEDDINGS_PROVIDER } from '../knowledge/ingestion/embeddings.port.js'
import { VECTOR_RETRIEVER } from '../knowledge/retrieval/vector-retriever.port.js'
import { buildAgentGraph } from './agent.graph.js'
import { createMongoCheckpointer } from './mongo-checkpointer.provider.js'
import { AGENT_CHAT_MODEL, AGENT_CHECKPOINTER, AGENT_GRAPH } from './agent.tokens.js'
import { RETRIEVE_KNOWLEDGE_DEFINITION } from './agent.config.js'
import { LangGraphAgentStrategy } from './langgraph-agent.strategy.js'
import { ASSISTANT_REPLY_STRATEGY, TUTOR_REPLY_STRATEGY } from './reply-strategy.port.js'
import { REPLY_STRATEGIES, ReplyStrategyRegistry } from './reply-strategy.registry.js'
import { ASSISTANT_SYSTEM_PROMPT } from './prompts/assistant-system-prompt.js'
import { AGENT_TOOLS } from './tools/agent-tool.port.js'
import { AgentToolRegistry } from './tools/agent-tool.registry.js'
import { ListMyConversationsTool } from './tools/list-my-conversations.tool.js'
import { SearchMyMessagesTool } from './tools/search-my-messages.tool.js'
import { TUTOR_SYSTEM_PROMPT } from '../knowledge/tutor/tutor-prompt.js'
import type { BaseCheckpointSaver } from '@langchain/langgraph'
import type { Connection } from 'mongoose'
import type { AppEnvironment } from '../config/environment.types.js'
import type { EmbeddingsProvider } from '../knowledge/ingestion/embeddings.port.js'
import type { VectorRetriever } from '../knowledge/retrieval/vector-retriever.port.js'
import type { CompiledAgentGraph } from './agent.graph.js'
import type { AgentTool } from './tools/agent-tool.port.js'
import type { ConversationReplyStrategy } from './reply-strategy.port.js'

// The agent bounded context. The tutor and the assistant conversation types share ONE
// compiled LangGraph agent graph and one event mapping; the two strategies differ only in
// the bound tools, the system prompt, and whether retrieval is forced. Tests override
// ASSISTANT_REPLY_STRATEGY with a fake so the OpenAI client is never called.
@Module({
  imports: [ConversationsModule, MessagesModule, KnowledgeModule],
  providers: [
    // User-data tools, available to both conversation types.
    ListMyConversationsTool,
    SearchMyMessagesTool,
    {
      provide: AGENT_TOOLS,
      useFactory: (
        listMyConversations: ListMyConversationsTool,
        searchMyMessages: SearchMyMessagesTool,
      ): AgentTool[] => [listMyConversations, searchMyMessages],
      inject: [ListMyConversationsTool, SearchMyMessagesTool],
    },
    AgentToolRegistry,

    // Shared singletons the graph is built from.
    {
      provide: AGENT_CHAT_MODEL,
      useFactory: (configService: ConfigService<AppEnvironment, true>): ChatOpenAI =>
        new ChatOpenAI({
          apiKey: configService.get('OPENAI_API_KEY', { infer: true }),
          model: configService.get('ASSISTANT_MODEL', { infer: true }),
          maxTokens: configService.get('ASSISTANT_MAX_TOKENS', { infer: true }),
        }),
      inject: [ConfigService],
    },
    {
      provide: AGENT_CHECKPOINTER,
      useFactory: (connection: Connection): Promise<BaseCheckpointSaver> =>
        createMongoCheckpointer(connection),
      inject: [getConnectionToken()],
    },
    {
      provide: AGENT_GRAPH,
      useFactory: (
        chatModel: ChatOpenAI,
        embeddings: EmbeddingsProvider,
        retriever: VectorRetriever,
        toolRegistry: AgentToolRegistry,
        checkpointer: BaseCheckpointSaver,
      ): CompiledAgentGraph =>
        buildAgentGraph({ chatModel, embeddings, retriever, toolRegistry, checkpointer }),
      inject: [AGENT_CHAT_MODEL, EMBEDDINGS_PROVIDER, VECTOR_RETRIEVER, AgentToolRegistry, AGENT_CHECKPOINTER],
    },

    // One strategy per conversation type, over the same graph. Assistant: user-data tools
    // only. Tutor: retrieval plus the same user-data tools, with retrieval forced so it
    // can never answer ungrounded.
    {
      provide: ASSISTANT_REPLY_STRATEGY,
      useFactory: (
        graph: CompiledAgentGraph,
        toolRegistry: AgentToolRegistry,
      ): ConversationReplyStrategy =>
        new LangGraphAgentStrategy(
          'assistant',
          graph,
          ASSISTANT_SYSTEM_PROMPT,
          toolRegistry.definitions(),
          false,
        ),
      inject: [AGENT_GRAPH, AgentToolRegistry],
    },
    {
      provide: TUTOR_REPLY_STRATEGY,
      useFactory: (
        graph: CompiledAgentGraph,
        toolRegistry: AgentToolRegistry,
      ): ConversationReplyStrategy =>
        new LangGraphAgentStrategy(
          'tutor',
          graph,
          TUTOR_SYSTEM_PROMPT,
          [RETRIEVE_KNOWLEDGE_DEFINITION, ...toolRegistry.definitions()],
          true,
        ),
      inject: [AGENT_GRAPH, AgentToolRegistry],
    },

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
export class AgentModule {}
