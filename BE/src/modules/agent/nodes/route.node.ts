import { MAX_TOOL_ROUNDS, RETRIEVE_KNOWLEDGE_TOOL } from '../constants.js'
import { readAgentConfigurable } from '../agent.config.js'
import { getToolCalls } from '../agent-events.js'
import type { ChatOpenAI } from '@langchain/openai'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentToolDefinition } from '../types/agent-tool.js'
import type { AgentState, AgentStateUpdate } from '../types/agent-state.js'

export function createRouteNode(chatModel: ChatOpenAI) {
  return async function route(
    state: AgentState,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    const { toolDefinitions, forceRetrieval } = readAgentConfigurable(config)
    const atRoundCap = state.toolRounds >= MAX_TOOL_ROUNDS

    if (toolDefinitions.length === 0 || atRoundCap) {
      return {}
    }

    const alreadyRetrieved = state.retrievedChunks.length > 0 || state.groundingEmpty
    const forceRetrieveNow =
      forceRetrieval && !alreadyRetrieved && state.toolRounds === 0

    const boundModel = chatModel.bindTools(toolDefinitions.map(toOpenAiTool), {
      tool_choice: forceRetrieveNow
        ? { type: 'function', function: { name: RETRIEVE_KNOWLEDGE_TOOL } }
        : 'auto',
    })

    const decision = await boundModel.invoke(state.messages, { signal: config.signal })
    return getToolCalls(decision).length > 0 ? { messages: [decision] } : {}
  }
}

export function routeDecision(state: AgentState): 'retrieve' | 'tool_call' | 'answer' {
  const toolCalls = getToolCalls(state.messages[state.messages.length - 1])
  if (toolCalls.length === 0) {
    return 'answer'
  }
  return toolCalls.some((call) => call.name === RETRIEVE_KNOWLEDGE_TOOL) ? 'retrieve' : 'tool_call'
}

function toOpenAiTool(definition: AgentToolDefinition): {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
} {
  return {
    type: 'function',
    function: {
      name: definition.name,
      description: definition.description,
      parameters: definition.parameters,
    },
  }
}
