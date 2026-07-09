import { END, START, StateGraph } from '@langchain/langgraph'
import { AgentStateAnnotation } from './agent.state.js'
import { createRouteNode, routeDecision } from './nodes/route.node.js'
import { createRetrieveNode } from './nodes/retrieve.node.js'
import { createToolCallNode } from './nodes/tool-call.node.js'
import { createToolResultNode } from './nodes/tool-result.node.js'
import { createAnswerNode } from './nodes/answer.node.js'
import type { BaseCheckpointSaver, CompiledStateGraph } from '@langchain/langgraph'
import type { ChatOpenAI } from '@langchain/openai'
import type { AgentState, AgentStateUpdate } from './agent.state.js'
import type { EmbeddingsProvider } from '../knowledge/ingestion/embeddings.port.js'
import type { VectorRetriever } from '../knowledge/retrieval/vector-retriever.port.js'
import type { AssistantToolRegistry } from '../assistant/tools/assistant-tool.registry.js'

export interface AgentGraphDependencies {
  chatModel: ChatOpenAI
  embeddings: EmbeddingsProvider
  retriever: VectorRetriever
  toolRegistry: AssistantToolRegistry
  checkpointer: BaseCheckpointSaver
}

export type AgentNodeName =
  | '__start__'
  | 'route'
  | 'retrieve'
  | 'tool_call'
  | 'tool_result'
  | 'answer'

export type CompiledAgentGraph = CompiledStateGraph<AgentState, AgentStateUpdate, AgentNodeName>

// The one shared agent graph. The tutor and the assistant run this exact topology; they
// differ only in the tools bound per run (and whether retrieval is forced) — passed via
// `configurable`, not baked into the graph.
//
//   START -> route -> (retrieve | tool_call | answer)
//   retrieve -> answer
//   tool_call -> tool_result -> route   (bounded loop)
//   answer -> END
export function buildAgentGraph(dependencies: AgentGraphDependencies): CompiledAgentGraph {
  return new StateGraph(AgentStateAnnotation)
    .addNode('route', createRouteNode(dependencies.chatModel))
    .addNode('retrieve', createRetrieveNode(dependencies.embeddings, dependencies.retriever))
    .addNode('tool_call', createToolCallNode(dependencies.toolRegistry))
    .addNode('tool_result', createToolResultNode())
    .addNode('answer', createAnswerNode(dependencies.chatModel))
    .addEdge(START, 'route')
    .addConditionalEdges('route', routeDecision, {
      retrieve: 'retrieve',
      tool_call: 'tool_call',
      answer: 'answer',
    })
    .addEdge('retrieve', 'answer')
    .addEdge('tool_call', 'tool_result')
    .addEdge('tool_result', 'route')
    .addEdge('answer', END)
    .compile({ checkpointer: dependencies.checkpointer })
}
