export type NodeEnvironment = 'development' | 'test' | 'production'

export interface AppEnvironment {
  NODE_ENV: NodeEnvironment
  PORT: number
  FRONTEND_ORIGIN: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: number
  MONGO_URI: string
  OPENAI_API_KEY: string
  ASSISTANT_MODEL: string
  ASSISTANT_MAX_TOKENS: number
}
