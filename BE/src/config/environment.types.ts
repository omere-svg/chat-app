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
  EMBEDDINGS_MODEL: string
  ATLAS_VECTOR_INDEX: string
  AWS_REGION: string
  S3_AVATAR_BUCKET: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AVATAR_CDN_BASE_URL: string
}
