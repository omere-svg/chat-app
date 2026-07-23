import { HumanMessage, ToolMessage } from '@langchain/core/messages'
import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import { AGENT_EVENT, RETRIEVE_KNOWLEDGE_TOOL } from '../constants.js'
import { readAgentConfigurable } from '../agent.config.js'
import { extractTextContent, getToolCalls } from '../message-content.js'
import { toCitation } from '../citation.mapper.js'
import {
  TUTOR_RETRIEVAL_MIN_SCORE,
  TUTOR_RETRIEVAL_TOP_K,
} from '../../knowledge-rag/tutor/tutor-retrieval.config.js'
import { buildTutorContext } from '../../knowledge-rag/tutor/tutor-prompt.js'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { EmbeddingsProvider } from '../../embeddings/types/embeddings-provider.js'
import type { VectorRetriever } from '../../knowledge-rag/types/vector-retriever.js'
import type { AgentState, AgentStateUpdate } from '../types/agent-state.js'

export function createRetrieveNode(
  embeddings: EmbeddingsProvider,
  retriever: VectorRetriever,
) {
  return async function retrieve(
    state: AgentState,
    config: RunnableConfig,
  ): Promise<AgentStateUpdate> {
    const { userId } = readAgentConfigurable(config)
    const call = findRetrievalCall(state)
    const query = resolveQuery(call?.args.query, state)

    await dispatchCustomEvent(AGENT_EVENT.tool, { name: RETRIEVE_KNOWLEDGE_TOOL }, config)

    const queryEmbedding = await embeddings.embedQuery(query)
    const chunks = await retriever.retrieveSimilarForUser({
      userId,
      queryEmbedding,
      limit: TUTOR_RETRIEVAL_TOP_K,
      minScore: TUTOR_RETRIEVAL_MIN_SCORE,
    })

    const toolMessage = new ToolMessage({
      tool_call_id: call?.id ?? RETRIEVE_KNOWLEDGE_TOOL,
      name: RETRIEVE_KNOWLEDGE_TOOL,
      content:
        chunks.length === 0
          ? 'No relevant passages were found in the user documents.'
          : buildTutorContext(chunks),
    })

    if (chunks.length === 0) {
      await dispatchCustomEvent(AGENT_EVENT.toolResult, { name: RETRIEVE_KNOWLEDGE_TOOL }, config)
      return { messages: [toolMessage], retrievedChunks: [], groundingEmpty: true }
    }

    await dispatchCustomEvent(AGENT_EVENT.citations, { citations: chunks.map(toCitation) }, config)
    await dispatchCustomEvent(AGENT_EVENT.toolResult, { name: RETRIEVE_KNOWLEDGE_TOOL }, config)
    return { messages: [toolMessage], retrievedChunks: chunks, groundingEmpty: false }
  }
}

export function retrieveDecision(state: AgentState): 'answer' | 'refuse' {
  return state.groundingEmpty ? 'refuse' : 'answer'
}

function findRetrievalCall(
  state: AgentState,
): { id?: string; args: { query?: unknown } } | undefined {
  return getToolCalls(state.messages[state.messages.length - 1]).find(
    (call) => call.name === RETRIEVE_KNOWLEDGE_TOOL,
  )
}

function resolveQuery(modelQuery: unknown, state: AgentState): string {
  if (typeof modelQuery === 'string' && modelQuery.trim().length > 0) {
    return modelQuery.trim()
  }
  for (let index = state.messages.length - 1; index >= 0; index--) {
    const message = state.messages[index]
    if (message instanceof HumanMessage) {
      return extractTextContent(message.content)
    }
  }
  return ''
}
