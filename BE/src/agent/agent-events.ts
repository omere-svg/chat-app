import type { BaseMessage, MessageContent } from '@langchain/core/messages'
import type { MessageCitation } from '../messages/message.entity.js'
import type { RetrievedChunk } from '../knowledge/knowledge-chunk.entity.js'

// A tool call as it appears on an AI message. Kept minimal and structural so it
// works whether the message is a full AIMessage (production) or an AIMessageChunk (some
// streaming paths).
export interface AgentToolCall {
  name: string
  args: Record<string, unknown>
  id?: string
}

// Reads tool calls off any message without relying on `instanceof AIMessage` (which fails
// for AIMessageChunk). Non-AI messages yield an empty list.
export function getToolCalls(message: BaseMessage | undefined): AgentToolCall[] {
  if (message === undefined) {
    return []
  }
  const calls = (message as { tool_calls?: AgentToolCall[] }).tool_calls
  return Array.isArray(calls) ? calls : []
}

// Custom stream events dispatched from within graph nodes and mapped by the strategy to
// AgentReplyChunks. Token deltas are NOT sent this way — they come from the answer
// node's model stream so the client sees real progressive generation.
export const AGENT_EVENT = {
  // A tool is about to run. Carries { name }.
  tool: 'agent_tool',
  // A tool finished. Carries { name }.
  toolResult: 'agent_tool_result',
  // Retrieval produced sources. Carries { citations }.
  citations: 'agent_citations',
  // Non-LLM text (the grounding refusal). Carries { text }.
  text: 'agent_text',
} as const

// Flattens LangChain message content (string or content-part array) to plain text.
export function extractTextContent(content: MessageContent | undefined): string {
  if (content === undefined) {
    return ''
  }
  if (typeof content === 'string') {
    return content
  }
  return content
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
}

export function toCitation(chunk: RetrievedChunk): MessageCitation {
  return {
    chunkId: chunk.id,
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    text: chunk.text,
    score: chunk.score,
  }
}
