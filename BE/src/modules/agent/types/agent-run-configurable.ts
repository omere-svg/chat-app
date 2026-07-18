import type { AgentToolDefinition } from './agent-tool.js'

export interface AgentRunConfigurable {
  userId: string
  toolDefinitions: AgentToolDefinition[]
  forceRetrieval: boolean
}
