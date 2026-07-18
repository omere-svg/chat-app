import { END, START, StateGraph } from '@langchain/langgraph'
import { AgentStateAnnotation } from './agent.state.js'
import { createRouteNode, routeDecision } from './nodes/route.node.js'
import { createRetrieveNode, retrieveDecision } from './nodes/retrieve.node.js'
import { createToolCallNode } from './nodes/tool-call.node.js'
import { createToolResultNode } from './nodes/tool-result.node.js'
import { createAnswerNode } from './nodes/answer.node.js'
import { createRefuseNode } from './nodes/refuse.node.js'
import type { AgentGraphDependencies, CompiledAgentGraph } from './types/agent-graph.js'

export function buildAgentGraph(dependencies: AgentGraphDependencies): CompiledAgentGraph {
  return new StateGraph(AgentStateAnnotation)
    .addNode('route', createRouteNode(dependencies.chatModel))
    .addNode('retrieve', createRetrieveNode(dependencies.embeddings, dependencies.retriever))
    .addNode('tool_call', createToolCallNode(dependencies.toolRegistry))
    .addNode('tool_result', createToolResultNode())
    .addNode('answer', createAnswerNode(dependencies.chatModel))
    .addNode('refuse', createRefuseNode())
    .addEdge(START, 'route')
    .addConditionalEdges('route', routeDecision, {
      retrieve: 'retrieve',
      tool_call: 'tool_call',
      answer: 'answer',
    })
    .addConditionalEdges('retrieve', retrieveDecision, {
      answer: 'answer',
      refuse: 'refuse',
    })
    .addEdge('tool_call', 'tool_result')
    .addEdge('tool_result', 'route')
    .addEdge('answer', END)
    .addEdge('refuse', END)
    .compile({ checkpointer: dependencies.checkpointer })
}
