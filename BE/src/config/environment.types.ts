export type NodeEnvironment = 'development' | 'test' | 'production'

export type PaymentProviderKind = 'rapyd' | 'fake'

export type PaymentQueueKind = 'sqs' | 'fake'

export interface AppEnvironment {
  NODE_ENV: NodeEnvironment
  PORT: number
  FRONTEND_ORIGIN: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: number
  EMAIL_CHANGE_JWT_SECRET: string
  EMAIL_CHANGE_JWT_EXPIRES_IN: number
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
  SES_REGION: string
  SES_SOURCE_EMAIL: string
  PAYMENT_PROVIDER_KIND: PaymentProviderKind
  RAPYD_ACCESS_KEY: string
  RAPYD_SECRET_KEY: string
  RAPYD_BASE_URL: string
  RAPYD_WEBHOOK_SECRET: string
  PAYMENT_QUEUE_KIND: PaymentQueueKind
  SQS_PAYMENT_QUEUE_URL: string
}
