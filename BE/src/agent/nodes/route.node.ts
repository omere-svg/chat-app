import { MAX_TOOL_ROUNDS, RETRIEVE_KNOWLEDGE_TOOL, readAgentConfigurable } from '../agent.config.js'
import { getToolCalls } from '../agent-events.js'
import type { ChatOpenAI } from '@langchain/openai'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AssistantToolDefinition } from '../../assistant/tools/assistant-tool.port.js'
import type { AgentState, AgentStateUpdate } from '../agent.state.js'

// Decides what happens next. Calls the model with the run's tools bound; if the model
// asks for a tool the message (with its tool_calls) is appended and the conditional edge
// dispatches to `retrieve` or `tool_call`. If the model wants no tool, nothing is
// appended and the edge falls through to `answer`, which streams the reply — this keeps
// answer generation in one place and avoids leaking the routing call's tokens.
export function createRouteNode(chatModel: ChatOpenAI) {
  return async function route(
    state: AgentState,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    const { toolDefinitions, forceRetrieval } = readAgentConfigurable(config)
    const atRoundCap = state.toolRounds >= MAX_TOOL_ROUNDS

    // No tools available (assistant with an empty set, or the round cap reached): let
    // `answer` produce the reply directly.
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

// Which node the last routing decision leads to. Reads the last message: an assistant
// message carrying a retrieval call goes to `retrieve`, any other tool call to
// `tool_call`, and anything else (a human/tool message, i.e. no tool requested) to
// `answer`.
export function routeDecision(state: AgentState): 'retrieve' | 'tool_call' | 'answer' {
  const toolCalls = getToolCalls(state.messages[state.messages.length - 1])
  if (toolCalls.length === 0) {
    return 'answer'
  }
  return toolCalls.some((call) => call.name === RETRIEVE_KNOWLEDGE_TOOL) ? 'retrieve' : 'tool_call'
}

function toOpenAiTool(definition: AssistantToolDefinition): {
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
