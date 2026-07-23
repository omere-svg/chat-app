import { RemoveMessage, SystemMessage } from '@langchain/core/messages'
import { REMOVE_ALL_MESSAGES } from '@langchain/langgraph'
import { RECURSION_LIMIT } from './constants.js'
import { toBaseMessage, toReplyChunk } from './agent-stream.mapper.js'
import type { BaseMessage } from '@langchain/core/messages'
import type { ConversationType } from '../../modules/conversations/types/conversation.entity.js'
import type { AgentToolDefinition } from './types/agent-tool.js'
import type {
  AgentReplyChunk,
  ConversationReplyStrategy,
  GenerateReplyInput,
} from './types/reply-strategy.js'
import type { CompiledAgentGraph } from './types/agent-graph.js'

export class LangGraphAgentStrategy implements ConversationReplyStrategy {
  constructor(
    readonly conversationType: ConversationType,
    private readonly graph: CompiledAgentGraph,
    private readonly systemPrompt: string,
    private readonly toolDefinitions: AgentToolDefinition[],
    private readonly forceRetrieval: boolean,
  ) {}

  async *generate(input: GenerateReplyInput): AsyncIterable<AgentReplyChunk> {
    const seededMessages: BaseMessage[] = [
      new RemoveMessage({ id: REMOVE_ALL_MESSAGES }),
      new SystemMessage(this.systemPrompt),
      ...input.history.map(toBaseMessage),
    ]

    const eventStream = this.graph.streamEvents(
      {
        messages: seededMessages,
        retrievedChunks: [],
        groundingEmpty: false,
        toolRounds: 0,
      },
      {
        version: 'v2',
        signal: input.signal,
        recursionLimit: RECURSION_LIMIT,
        configurable: {
          thread_id: input.conversationId,
          userId: input.userId,
          toolDefinitions: this.toolDefinitions,
          forceRetrieval: this.forceRetrieval,
        },
      },
    )

    for await (const event of eventStream) {
      if (input.signal.aborted) {
        return
      }
      const chunk = toReplyChunk(event)
      if (chunk !== null) {
        yield chunk
      }
    }
  }
}
