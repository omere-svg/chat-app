import type { ConversationType } from '../conversations/conversation.entity.js'

// DI token for the bound assistant reply strategy. Production binds the OpenAI
// strategy; tests bind a deterministic fake so CI never calls a real LLM.
export const ASSISTANT_REPLY_STRATEGY = Symbol('ASSISTANT_REPLY_STRATEGY')

// A single turn of conversation history as the LLM sees it. The orchestrator maps
// persisted messages to this shape (own user -> 'user', assistant -> 'assistant').
export interface AssistantTurnMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GenerateReplyInput {
  // The authenticated user. Forwarded to tools so they only ever read this user's
  // data — never trusted from model output.
  userId: string
  conversationId: string
  // Recent history oldest-first, including the just-sent user message as the last entry.
  history: AssistantTurnMessage[]
  // Aborted when the client disconnects; the strategy must stop work promptly.
  signal: AbortSignal
}

// Low-level chunks a strategy emits while producing a reply. The orchestrator turns
// these into SSE events and accumulates text deltas into the persisted reply body.
export type AssistantReplyChunk =
  | { type: 'text-delta'; text: string }
  | { type: 'tool-invoked'; name: string }

// The durable seam (weeks 7-8 register additional strategies, e.g. a RAG 'tutor').
// One strategy per conversation type; the orchestrator and transport never change.
export interface ConversationReplyStrategy {
  readonly conversationType: ConversationType
  generate(input: GenerateReplyInput): AsyncIterable<AssistantReplyChunk>
}
