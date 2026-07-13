import { AIMessage } from '@langchain/core/messages'
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import { AGENT_EVENT } from '../agent-events.js'
import { TUTOR_NO_CONTEXT_REPLY } from '../../knowledge/tutor/tutor-prompt.js'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentStateUpdate } from '../agent.state.js'

// Terminal step for a required retrieval that came back empty: emits the fixed refusal
// with NO model call (nothing can hallucinate). Only the retrieve path reaches here, so
// the no-context guard lives outside the shared `answer` node.
export function createRefuseNode() {
  return async function refuse(
    _state: unknown,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    await dispatchCustomEvent(AGENT_EVENT.text, { text: TUTOR_NO_CONTEXT_REPLY }, config)
    return { messages: [new AIMessage(TUTOR_NO_CONTEXT_REPLY)] }
  }
}
