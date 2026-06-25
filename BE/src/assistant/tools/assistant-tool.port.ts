// Provider-agnostic tool contract. Tools are the durable asset reused across weeks
// 6-8 (plain LLM loop, RAG, LangGraph), so they depend on no specific SDK.

// DI token for the array of registered tools, collected by the assistant module.
export const ASSISTANT_TOOLS = Symbol('ASSISTANT_TOOLS')

// Everything a tool exposes to the model. `parameters` is a JSON Schema describing
// ONLY model-facing inputs — never the user id, which is injected server-side.
export interface AssistantToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

// Server-side execution context. `userId` is the authenticated caller; tools must
// scope every read to it and never accept a user id from model output.
export interface AssistantToolContext {
  userId: string
}

export interface AssistantTool {
  readonly definition: AssistantToolDefinition
  // Validates rawInput (untrusted model output) at the boundary, then runs scoped to
  // context.userId. Returns a JSON-serializable result handed back to the model.
  execute(rawInput: unknown, context: AssistantToolContext): Promise<unknown>
}
