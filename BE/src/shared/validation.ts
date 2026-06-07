import type { ZodType } from 'zod'
import { ApiError } from './ApiError.js'

export function parseRequest<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    throw ApiError.validation('Request validation failed', details)
  }

  return result.data
}
