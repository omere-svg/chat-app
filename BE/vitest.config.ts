import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  oxc: false,
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.e2e-spec.ts', 'src/**/*.spec.ts'],
    env: {
      NODE_ENV: 'test',
      PORT: '4010',
      FRONTEND_ORIGIN: 'http://localhost:5173',
      JWT_SECRET: 'e2e-test-secret-at-least-32-characters-long',
      JWT_EXPIRES_IN: '3600',
      EMAIL_CHANGE_JWT_SECRET: 'e2e-email-change-secret-at-least-32-characters-long',
      EMAIL_CHANGE_JWT_EXPIRES_IN: '1800',
      SES_SOURCE_EMAIL: 'no-reply@example.com',
      // Satisfies env validation; tests bind FakeAssistantStrategy, so this key is
      // never used to reach OpenAI. Falls back to a dummy so CI stays hermetic, but
      // a real key in the environment flows through for the opt-in RUN_LLM_EVALS suite.
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? 'test-openai-key',
    },
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
  plugins: [swc.vite()],
})
