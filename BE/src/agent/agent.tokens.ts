// DI tokens for the agent's shared, singleton collaborators. Kept together so the module
// wiring reads clearly and tests can override any of them in isolation.
export const AGENT_CHAT_MODEL = Symbol('AGENT_CHAT_MODEL')
export const AGENT_CHECKPOINTER = Symbol('AGENT_CHECKPOINTER')
export const AGENT_GRAPH = Symbol('AGENT_GRAPH')
