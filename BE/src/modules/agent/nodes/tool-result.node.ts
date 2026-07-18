import { ToolMessage } from '@langchain/core/messages'
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import { AGENT_EVENT } from '../constants.js'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentState, AgentStateUpdate } from '../agent.state.js'

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
