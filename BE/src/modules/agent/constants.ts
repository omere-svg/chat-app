import type { AgentToolDefinition } from './types/agent-tool.js'

export const RETRIEVE_KNOWLEDGE_TOOL = 'retrieve_knowledge'

export const LIST_MY_CONVERSATIONS_TOOL = 'list_my_conversations'

export const SEARCH_MY_MESSAGES_TOOL = 'search_my_messages'

export const MAX_TOOL_ROUNDS = 3

export const RECURSION_LIMIT = 25

export const AGENT_EVENT = {
  tool: 'agent_tool',
  toolResult: 'agent_tool_result',
  citations: 'agent_citations',
  text: 'agent_text',
} as const

export const AGENT_NODE = {
  route: 'route',
  retrieve: 'retrieve',
  toolCall: 'tool_call',
  toolResult: 'tool_result',
  answer: 'answer',
  refuse: 'refuse',
} as const

export const RETRIEVE_KNOWLEDGE_DEFINITION: AgentToolDefinition = {
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
