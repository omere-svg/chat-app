export interface AgentToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface AgentToolContext {
  userId: string
}

export interface AgentTool {
  readonly definition: AgentToolDefinition
  execute(rawInput: unknown, context: AgentToolContext): Promise<unknown>
}
