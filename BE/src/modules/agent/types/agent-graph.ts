import type { BaseCheckpointSaver, CompiledStateGraph } from '@langchain/langgraph'
import type { ChatOpenAI } from '@langchain/openai'
import type { AgentState, AgentStateUpdate } from '../agent.state.js'
import type { EmbeddingsProvider } from '../../embeddings/types/embeddings-provider.js'
import type { VectorRetriever } from '../../knowledge-rag/types/vector-retriever.js'
import type { AgentToolRegistry } from '../tools/agent-tool.registry.js'

export interface AgentGraphDependencies {
  chatModel: ChatOpenAI
  embeddings: EmbeddingsProvider
  retriever: VectorRetriever
  toolRegistry: AgentToolRegistry
  checkpointer: BaseCheckpointSaver
}

export type AgentNodeName =
  | '__start__'
  | 'route'
  | 'retrieve'
  | 'tool_call'
  | 'tool_result'
  | 'answer'
  | 'refuse'

export type CompiledAgentGraph = CompiledStateGraph<AgentState, AgentStateUpdate, AgentNodeName>
