import { Annotation, MessagesAnnotation } from '@langchain/langgraph'
import type { RetrievedChunk } from '../../modules/knowledge-chunk/types/knowledge-chunk.entity.js'

export const AgentStateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,

  retrievedChunks: Annotation<RetrievedChunk[]>({
    reducer: (_previous, next) => next,
    default: () => [],
  }),

  groundingEmpty: Annotation<boolean>({
    reducer: (_previous, next) => next,
    default: () => false,
  }),

  toolRounds: Annotation<number>({
    reducer: (_previous, next) => next,
    default: () => 0,
  }),
})

export type AgentState = typeof AgentStateAnnotation.State
export type AgentStateUpdate = typeof AgentStateAnnotation.Update
