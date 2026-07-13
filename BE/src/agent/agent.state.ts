import { Annotation, MessagesAnnotation } from '@langchain/langgraph'
import type { RetrievedChunk } from '../knowledge/knowledge-chunk.entity.js'

// The agent's typed, documented state. `messages` is the running transcript the model
// sees; the other channels carry per-run working state.
//
// Source-of-truth note: MongoDB (the `messages` collection) owns conversation history.
// Each turn the strategy re-seeds `messages` from Mongo (clearing any prior checkpointed
// transcript), so the MongoDB checkpoint only has to survive a single interrupted run
// rather than becoming a second, divergent copy of the conversation.
export const AgentStateAnnotation = Annotation.Root({
  // Running transcript. Uses LangGraph's messages reducer (append + reconcile by id,
  // and honors RemoveMessage(REMOVE_ALL_MESSAGES) so a turn can reset the transcript).
  ...MessagesAnnotation.spec,

  // Chunks the most recent `retrieve` step grounded on. Source of the citations shown to
  // the user and persisted on the reply; empty when nothing cleared the relevance floor.
  retrievedChunks: Annotation<RetrievedChunk[]>({
    reducer: (_previous, next) => next,
    default: () => [],
  }),

  // Set by `retrieve` when a required retrieval returned nothing above threshold. Signals
  // `answer` to refuse without an LLM call, preserving the no-hallucination guarantee.
  groundingEmpty: Annotation<boolean>({
    reducer: (_previous, next) => next,
    default: () => false,
  }),

  // Completed tool rounds this turn. Caps the `route` <-> `tool_result` loop.
  toolRounds: Annotation<number>({
    reducer: (_previous, next) => next,
    default: () => 0,
  }),
})

export type AgentState = typeof AgentStateAnnotation.State
export type AgentStateUpdate = typeof AgentStateAnnotation.Update
