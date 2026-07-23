import { END, START, StateGraph } from '@langchain/langgraph'
import { AgentStateAnnotation } from './agent.state.js'
import { AGENT_NODE } from './constants.js'
import { createRouteNode, routeDecision } from './nodes/route.node.js'
import { createRetrieveNode, retrieveDecision } from './nodes/retrieve.node.js'
import { createToolCallNode } from './nodes/tool-call.node.js'
import { createToolResultNode } from './nodes/tool-result.node.js'
import { createAnswerNode } from './nodes/answer.node.js'
import { createRefuseNode } from './nodes/refuse.node.js'
import type { AgentGraphDependencies, CompiledAgentGraph } from './types/agent-graph.js'

export function buildAgentGraph(dependencies: AgentGraphDependencies): CompiledAgentGraph {
  return new StateGraph(AgentStateAnnotation)
    .addNode(AGENT_NODE.route, createRouteNode(dependencies.chatModel))
    .addNode(AGENT_NODE.retrieve, createRetrieveNode(dependencies.embeddings, dependencies.retriever))
    .addNode(AGENT_NODE.toolCall, createToolCallNode(dependencies.toolRegistry))
    .addNode(AGENT_NODE.toolResult, createToolResultNode())
    .addNode(AGENT_NODE.answer, createAnswerNode(dependencies.chatModel))
    .addNode(AGENT_NODE.refuse, createRefuseNode())
    .addEdge(START, AGENT_NODE.route)
    .addConditionalEdges(AGENT_NODE.route, routeDecision, {
      [AGENT_NODE.retrieve]: AGENT_NODE.retrieve,
      [AGENT_NODE.toolCall]: AGENT_NODE.toolCall,
      [AGENT_NODE.answer]: AGENT_NODE.answer,
    })
    .addConditionalEdges(AGENT_NODE.retrieve, retrieveDecision, {
      [AGENT_NODE.answer]: AGENT_NODE.answer,
      [AGENT_NODE.refuse]: AGENT_NODE.refuse,
    })
    .addEdge(AGENT_NODE.toolCall, AGENT_NODE.toolResult)
    .addEdge(AGENT_NODE.toolResult, AGENT_NODE.route)
    .addEdge(AGENT_NODE.answer, END)
    .addEdge(AGENT_NODE.refuse, END)
    .compile({ checkpointer: dependencies.checkpointer })
}
