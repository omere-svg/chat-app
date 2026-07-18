import { AIMessage } from '@langchain/core/messages'
import { extractTextContent } from '../agent-events.js'
import type { ChatOpenAI } from '@langchain/openai'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentState, AgentStateUpdate } from '../agent.state.js'

export function createAnswerNode(chatModel: ChatOpenAI) {
  return async function answer(
    state: AgentState,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    const stream = await chatModel.stream(state.messages, { signal: config.signal })
    let content = ''
    for await (const chunk of stream) {
      content += extractTextContent(chunk.content)
    }

    return { messages: [new AIMessage(content)] }
  }
}
