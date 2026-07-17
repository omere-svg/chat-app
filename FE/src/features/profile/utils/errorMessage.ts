import { ApiError } from '@/api/apiClient.ts'
import { ERROR_MESSAGE_FALLBACK } from '../constants/messages.ts'

export function errorMessageFrom(error: unknown): string {
  return error instanceof ApiError ? error.message : ERROR_MESSAGE_FALLBACK
}
