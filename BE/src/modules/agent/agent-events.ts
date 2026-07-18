import type { BaseMessage, MessageContent } from '@langchain/core/messages'
import type { MessageCitation } from '../../modules/messages/types/message.entity.js'
import type { RetrievedChunk } from '../../modules/knowledge-chunk/types/knowledge-chunk.entity.js'
import type { AgentToolCall } from './types/agent-tool-call.js'

export function getToolCalls(message: BaseMessage | undefined): AgentToolCall[] {
  if (message === undefined) {
    return []
  }
  const calls = (message as { tool_calls?: AgentToolCall[] }).tool_calls
  return Array.isArray(calls) ? calls : []
}

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
