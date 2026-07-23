import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { AGENT_EVENT, AGENT_NODE } from './constants.js'
import { extractTextContent } from './message-content.js'
import type { BaseMessage, MessageContent } from '@langchain/core/messages'
import type { StreamEvent } from '@langchain/core/tracers/log_stream'
import type { MessageCitation } from '../../modules/messages/types/message.entity.js'
import type { AgentReplyChunk, AgentTurnMessage } from './types/reply-strategy.js'

export function toReplyChunk(event: StreamEvent): AgentReplyChunk | null {
  if (
    event.event === 'on_chat_model_stream' &&
    event.metadata?.langgraph_node === AGENT_NODE.answer
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

export function toBaseMessage(turn: AgentTurnMessage): BaseMessage {
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
