import { ToolMessage } from '@langchain/core/messages'
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import { AGENT_EVENT } from '../constants.js'
import { readAgentConfigurable } from '../agent.config.js'
import { getToolCalls } from '../agent-events.js'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentToolRegistry } from '../tools/agent-tool.registry.js'
import type { AgentState, AgentStateUpdate } from '../agent.state.js'

export function createToolCallNode(toolRegistry: AgentToolRegistry) {
  return async function toolCall(
    state: AgentState,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    const { userId } = readAgentConfigurable(config)
    const calls = getToolCalls(state.messages[state.messages.length - 1])

    const toolMessages: ToolMessage[] = []
    for (const call of calls) {
      await dispatchCustomEvent(AGENT_EVENT.tool, { name: call.name }, config)
      const result = await toolRegistry.execute(call.name, call.args, { userId })
      toolMessages.push(
        new ToolMessage({
          tool_call_id: call.id ?? call.name,
          name: call.name,
          content: JSON.stringify(result),
        }),
      )
    }

    return { messages: toolMessages }
  }
}
