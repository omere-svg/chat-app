export type NodeEnvironment = 'development' | 'test' | 'production'

export interface AppEnvironment {
  NODE_ENV: NodeEnvironment
  PORT: number
  FRONTEND_ORIGIN: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: number
  MONGO_URI: string
}
