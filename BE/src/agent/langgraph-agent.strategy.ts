import {
  AIMessage,
  HumanMessage,
  RemoveMessage,
  SystemMessage,
} from '@langchain/core/messages'
import { REMOVE_ALL_MESSAGES } from '@langchain/langgraph'
import { AGENT_EVENT, extractTextContent } from './agent-events.js'
import type { BaseMessage, MessageContent } from '@langchain/core/messages'
import type { StreamEvent } from '@langchain/core/tracers/log_stream'
import type { ConversationType } from '../conversations/conversation.entity.js'
import type { MessageCitation } from '../messages/message.entity.js'
import type { AssistantToolDefinition } from '../assistant/tools/assistant-tool.port.js'
import type {
  AssistantReplyChunk,
  AssistantTurnMessage,
  ConversationReplyStrategy,
  GenerateReplyInput,
} from '../assistant/reply-strategy.port.js'
import type { CompiledAgentGraph } from './agent.graph.js'

// Bounds the graph's step count as a final safety net beyond MAX_TOOL_ROUNDS.
const RECURSION_LIMIT = 25

// Runs the shared agent graph for one conversation type. The tutor and the assistant use
// the same graph and the same event mapping; a strategy instance only carries the
// per-type differences: the system prompt, the bound tools, and whether retrieval is
// forced. The orchestrator and SSE transport never see any of this.
export class LangGraphAgentStrategy implements ConversationReplyStrategy {
  constructor(
    readonly conversationType: ConversationType,
    private readonly graph: CompiledAgentGraph,
    private readonly systemPrompt: string,
    private readonly toolDefinitions: AssistantToolDefinition[],
    private readonly forceRetrieval: boolean,
  ) {}

  async *generate(input: GenerateReplyInput): AsyncIterable<AssistantReplyChunk> {
    // Re-seed the transcript from MongoDB every turn: RemoveMessage(REMOVE_ALL_MESSAGES)
    // clears any prior checkpointed transcript so Mongo stays the single source of truth,
    // then the system prompt and fresh history are appended.
    const seededMessages: BaseMessage[] = [
      new RemoveMessage({ id: REMOVE_ALL_MESSAGES }),
      new SystemMessage(this.systemPrompt),
      ...input.history.map(toBaseMessage),
    ]

    const eventStream = this.graph.streamEvents(
      { messages: seededMessages },
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

function toReplyChunk(event: StreamEvent): AssistantReplyChunk | null {
  // Progressive answer tokens come only from the answer node's model stream.
  if (
    event.event === 'on_chat_model_stream' &&
    event.metadata?.langgraph_node === 'answer'
  ) {
    const data = event.data as { chunk?: { content?: MessageContent } }
    const text = extractTextContent(data.chunk?.content)
    return text.length > 0 ? { type: 'text-delta', text } : null
  }

  if (event.event === 'on_custom_event') {
    switch (event.name) {
      case AGENT_EVENT.tool:
        return { type: 'tool-invoked', name: toName(event.data) }
      case AGENT_EVENT.toolResult:
        return { type: 'tool-result', name: toName(event.data) }
      case AGENT_EVENT.citations:
        return { type: 'citations', citations: toCitations(event.data) }
      case AGENT_EVENT.text: {
        const data = event.data as { text?: unknown }
        const text = typeof data.text === 'string' ? data.text : ''
        return text.length > 0 ? { type: 'text-delta', text } : null
      }
      default:
        return null
    }
  }

  return null
}

function toBaseMessage(turn: AssistantTurnMessage): BaseMessage {
  return turn.role === 'user' ? new HumanMessage(turn.content) : new AIMessage(turn.content)
}

function toName(data: unknown): string {
  return isRecord(data) && typeof data.name === 'string' ? data.name : ''
}

function toCitations(data: unknown): MessageCitation[] {
  if (isRecord(data) && Array.isArray(data.citations)) {
    return data.citations as MessageCitation[]
  }
  return []
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
