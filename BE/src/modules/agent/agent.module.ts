import { Module } from '@nestjs/common'
import { getConnectionToken } from '@nestjs/mongoose'
import { ChatOpenAI } from '@langchain/openai'
import { ConversationsModule } from '../../modules/conversations/conversations.module.js'
import { MessagesModule } from '../../modules/messages/messages.module.js'
import { KnowledgeRagModule } from '../knowledge-rag/knowledge-rag.module.js'
import { EmbeddingsModule } from '../embeddings/embeddings.module.js'
import { EMBEDDINGS_PROVIDER } from '../embeddings/embeddings.tokens.js'
import { ChatModelModule } from '../chat-model/chat-model.module.js'
import { CHAT_MODEL } from '../chat-model/chat-model.tokens.js'
import { VECTOR_RETRIEVER } from '../knowledge-rag/retrieval/vector-retriever.tokens.js'
import { buildAgentGraph } from './agent.graph.js'
import { createMongoCheckpointer } from './mongo-checkpointer.provider.js'
import {
  AGENT_CHECKPOINTER,
  AGENT_GRAPH,
  AGENT_TOOLS,
  ASSISTANT_REPLY_STRATEGY,
  REPLY_STRATEGIES,
  TUTOR_REPLY_STRATEGY,
} from './agent.tokens.js'
import { RETRIEVE_KNOWLEDGE_DEFINITION } from './constants.js'
import { LangGraphAgentStrategy } from './langgraph-agent.strategy.js'
import { ReplyStrategyRegistry } from './reply-strategy.registry.js'
import { ASSISTANT_SYSTEM_PROMPT } from './prompts/assistant-system-prompt.js'
import { AgentToolRegistry } from './tools/agent-tool.registry.js'
import { ListMyConversationsTool } from './tools/list-my-conversations.tool.js'
import { SearchMyMessagesTool } from './tools/search-my-messages.tool.js'
import { TUTOR_SYSTEM_PROMPT } from '../knowledge-rag/tutor/tutor-prompt.js'
import type { BaseCheckpointSaver } from '@langchain/langgraph'
import type { Connection } from 'mongoose'
import type { EmbeddingsProvider } from '../embeddings/types/embeddings-provider.js'
import type { VectorRetriever } from '../knowledge-rag/types/vector-retriever.js'
import type { CompiledAgentGraph } from './types/agent-graph.js'
import type { AgentTool } from './types/agent-tool.js'
import type { ConversationReplyStrategy } from './types/reply-strategy.js'

@Module({
  imports: [ConversationsModule, MessagesModule, KnowledgeRagModule, EmbeddingsModule, ChatModelModule],
  providers: [
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
      inject: [CHAT_MODEL, EMBEDDINGS_PROVIDER, VECTOR_RETRIEVER, AgentToolRegistry, AGENT_CHECKPOINTER],
    },
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
