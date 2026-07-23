import { AIMessage } from '@langchain/core/messages'
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import { AGENT_EVENT } from '../constants.js'
import { TUTOR_NO_CONTEXT_REPLY } from '../../knowledge-rag/tutor/tutor-prompt.js'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentStateUpdate } from '../types/agent-state.js'

export function createRefuseNode() {
  return async function refuse(
    _state: unknown,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    await dispatchCustomEvent(AGENT_EVENT.text, { text: TUTOR_NO_CONTEXT_REPLY }, config)
    return { messages: [new AIMessage(TUTOR_NO_CONTEXT_REPLY)] }
  }
}
