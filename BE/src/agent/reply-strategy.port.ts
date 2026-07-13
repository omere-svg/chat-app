import type { ConversationType } from '../conversations/conversation.entity.js'
import type { MessageCitation } from '../messages/message.entity.js'

// DI tokens for the bound reply strategies, one per AI conversation type. Production
// binds the LangGraph agent strategy to both; tests bind a deterministic fake to
// ASSISTANT_REPLY_STRATEGY so CI never calls a real LLM.
export const ASSISTANT_REPLY_STRATEGY = Symbol('ASSISTANT_REPLY_STRATEGY')
export const TUTOR_REPLY_STRATEGY = Symbol('TUTOR_REPLY_STRATEGY')

// A single turn of conversation history as the LLM sees it. The orchestrator maps
// persisted messages to this shape (own user -> 'user', AI reply -> 'assistant').
export interface AgentTurnMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateReplyInput {
  // The authenticated user. Forwarded to tools so they only ever read this user's
  // data — never trusted from model output.
  userId: string
  conversationId: string
  // Recent history oldest-first, including the just-sent user message as the last entry.
  history: AgentTurnMessage[]
  // Aborted when the client disconnects; the strategy must stop work promptly.
  signal: AbortSignal
}

// Low-level chunks a strategy emits while producing a reply. The orchestrator turns
// these into SSE events, accumulates text deltas into the persisted reply body, and
// attaches citations to the persisted reply. 'tool-invoked' announces a tool starting and
// 'tool-result' its completion; 'citations' carries retrieval sources (tutor only, by
// virtue of it being the only type with the retrieval tool available).
export type AgentReplyChunk =
  | { type: 'text-delta'; text: string }
  | { type: 'tool-invoked'; name: string }
  | { type: 'tool-result'; name: string }
  | { type: 'citations'; citations: MessageCitation[] }

// The durable seam (weeks 7-8 register additional strategies, e.g. a RAG 'tutor').
// One strategy per conversation type; the orchestrator and transport never change.
export interface ConversationReplyStrategy {
  readonly conversationType: ConversationType
  generate(input: GenerateReplyInput): AsyncIterable<AgentReplyChunk>
}
