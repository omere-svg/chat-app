import 'reflect-metadata'
import { describe, expect, it } from 'vitest'
import { validateEnvironment } from './environment.schema.js'

const BASE_ENVIRONMENT = {
  NODE_ENV: 'test',
  PORT: '4000',
  FRONTEND_ORIGIN: 'http://localhost:5173',
  JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
  JWT_EXPIRES_IN: '3600',
  EMAIL_CHANGE_JWT_SECRET: 'test-email-change-secret-at-least-32-characters-long',
  MONGO_URI: 'mongodb://localhost:27017/chat',
  OPENAI_API_KEY: 'test-openai-key',
  AWS_REGION: 'eu-west-1',
}

describe('validateEnvironment', () => {
  it('accepts an empty SES region so email sending can fall back to the AWS region', () => {
    const environment = validateEnvironment({ ...BASE_ENVIRONMENT, SES_REGION: '' })

    expect(environment.SES_REGION).toBe('')
    expect(environment.AWS_REGION).toBe('eu-west-1')
  })

  it('rejects a non-string SES region', () => {
    expect(() => validateEnvironment({ ...BASE_ENVIRONMENT, SES_REGION: 123 })).toThrow(
      /SES_REGION must be a string/,
    )
  })
})
