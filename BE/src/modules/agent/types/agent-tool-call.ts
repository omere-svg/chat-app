export interface AgentToolCall {
  name: string
  args: Record<string, unknown>
  id?: string
}
