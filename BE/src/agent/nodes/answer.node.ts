import { AIMessage } from '@langchain/core/messages'
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import { AGENT_EVENT, extractTextContent } from '../agent-events.js'
import { TUTOR_NO_CONTEXT_REPLY } from '../../knowledge/tutor/tutor-prompt.js'
import type { ChatOpenAI } from '@langchain/openai'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentState, AgentStateUpdate } from '../agent.state.js'

// Produces the final reply. When a required retrieval came back empty it emits the fixed
// refusal with NO model call (nothing can hallucinate). Otherwise it streams the answer
// from the accumulated transcript with tools disabled; those token deltas are what the
// client renders progressively (filtered by langgraph_node === 'answer').
export function createAnswerNode(chatModel: ChatOpenAI) {
  return async function answer(
    state: AgentState,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    if (state.groundingEmpty) {
      await dispatchCustomEvent(AGENT_EVENT.text, { text: TUTOR_NO_CONTEXT_REPLY }, config)
      return { messages: [new AIMessage(TUTOR_NO_CONTEXT_REPLY)] }
    }

    const stream = await chatModel.stream(state.messages, { signal: config.signal })
    let content = ''
    for await (const chunk of stream) {
      content += extractTextContent(chunk.content)
    }

    return { messages: [new AIMessage(content)] }
  }
}
