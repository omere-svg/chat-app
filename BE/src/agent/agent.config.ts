import type { RunnableConfig } from '@langchain/core/runnables'
import type { AssistantToolDefinition } from '../assistant/tools/assistant-tool.port.js'

// The tool the agent invokes to ground an answer in the user's uploaded documents.
// Retrieval is modelled as a tool the model calls, but handled by the dedicated
// `retrieve` node (which produces citations and enforces the grounding guard).
export const RETRIEVE_KNOWLEDGE_TOOL = 'retrieve_knowledge'

// Caps the route <-> tool loop so a misbehaving model can't spin forever. Mirrors the
// previous assistant strategy's MAX_TOOL_ROUNDS.
export const MAX_TOOL_ROUNDS = 3

// Per-invocation values passed through LangGraph's `configurable`. These are the ONLY
// things that differ between the tutor and the assistant on the shared graph. `userId`
// comes from the authenticated request and is never sourced from model output.
export interface AgentRunConfigurable {
  userId: string
  // Tool definitions the `route` node binds to the model this run.
  toolDefinitions: AssistantToolDefinition[]
  // Tutor only: force a retrieval before the model may answer, preserving grounding.
  forceRetrieval: boolean
}

// Reads and validates the per-run configurable. Throwing here surfaces a wiring bug
// loudly rather than silently degrading to an unscoped or tool-less run.
export function readAgentConfigurable(config: RunnableConfig): AgentRunConfigurable {
  const configurable = (config.configurable ?? {}) as {
    userId?: unknown
    toolDefinitions?: unknown
    forceRetrieval?: unknown
  }
  if (typeof configurable.userId !== 'string' || configurable.userId.length === 0) {
    throw new Error('Agent run is missing a userId in its configurable')
  }
  return {
    userId: configurable.userId,
    toolDefinitions: Array.isArray(configurable.toolDefinitions)
      ? (configurable.toolDefinitions as AssistantToolDefinition[])
      : [],
    forceRetrieval: configurable.forceRetrieval === true,
  }
}

// The model-facing definition of the retrieval tool. Only the search query is exposed to
// the model; the user scope is injected server-side in the `retrieve` node.
export const RETRIEVE_KNOWLEDGE_DEFINITION: AssistantToolDefinition = {
  name: RETRIEVE_KNOWLEDGE_TOOL,
  description:
    "Search the signed-in user's own uploaded documents for passages relevant to a " +
    'question. Call this before answering anything that needs grounded knowledge from ' +
    'their materials.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'A focused natural-language search query for the user documents.',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
}
