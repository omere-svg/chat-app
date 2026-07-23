import { HttpResponse } from 'msw'
import type { ApiErrorPayload } from '../types/api.ts'

export function jsonApiError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): ReturnType<typeof HttpResponse.json> {
  const payload: ApiErrorPayload = {
    code,
    message,
    ...(details === undefined ? {} : { details }),
  }
  return HttpResponse.json({ error: payload }, { status })
}
