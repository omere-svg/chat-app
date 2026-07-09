import { ToolMessage } from '@langchain/core/messages'
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import { AGENT_EVENT } from '../agent-events.js'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentState, AgentStateUpdate } from '../agent.state.js'

// Reports completion of the tools answered in the round just finished and advances the
// round counter, then loops back to `route` so the model can use the results to decide
// whether to answer or call more tools (bounded by MAX_TOOL_ROUNDS).
export function createToolResultNode() {
  return async function toolResult(
    state: AgentState,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    for (const name of trailingToolNames(state)) {
      await dispatchCustomEvent(AGENT_EVENT.toolResult, { name }, config)
    }
    return { toolRounds: state.toolRounds + 1 }
  }
}

// Names of the ToolMessages at the tail of the transcript — the results produced by the
// most recent `tool_call` step.
function trailingToolNames(state: AgentState): string[] {
  const names: string[] = []
  for (let index = state.messages.length - 1; index >= 0; index--) {
    const message = state.messages[index]
    if (!(message instanceof ToolMessage)) {
      break
    }
    if (typeof message.name === 'string' && message.name.length > 0) {
      names.unshift(message.name)
    }
  }
  return names
}
