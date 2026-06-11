import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  oxc: false,
  test: {
    globals: false,
    environment: 'node',
    include: ['src/test/**/*.e2e-spec.ts'],
    env: {
      PORT: '4010',
      FRONTEND_ORIGIN: 'http://localhost:5173',
      JWT_SECRET: 'e2e-test-secret-at-least-32-characters-long',
      JWT_EXPIRES_IN: '3600',
    },
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
  plugins: [swc.vite()],
})
