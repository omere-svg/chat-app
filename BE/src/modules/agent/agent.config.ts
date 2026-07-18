import { MissingAgentUserError } from './errors/missing-agent-user.error.js'
import type { RunnableConfig } from '@langchain/core/runnables'
import type { AgentToolDefinition } from './types/agent-tool.js'
import type { AgentRunConfigurable } from './types/agent-run-configurable.js'

export function readAgentConfigurable(config: RunnableConfig): AgentRunConfigurable {
  const configurable = (config.configurable ?? {}) as {
    userId?: unknown
    toolDefinitions?: unknown
    forceRetrieval?: unknown
  }
  if (typeof configurable.userId !== 'string' || configurable.userId.length === 0) {
    throw new MissingAgentUserError()
  }
  return {
    userId: configurable.userId,
    toolDefinitions: Array.isArray(configurable.toolDefinitions)
      ? (configurable.toolDefinitions as AgentToolDefinition[])
      : [],
    forceRetrieval: configurable.forceRetrieval === true,
  }
}
