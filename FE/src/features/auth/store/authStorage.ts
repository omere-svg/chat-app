import { apiClient } from '@/api/apiClient.ts'
import { isRecord, parseUserResponse } from '@/api/parseApiResponse.ts'
import type { StoredAuth } from '../types/auth.ts'

const STORAGE_KEY = 'chat-auth'

export function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || typeof parsed.token !== 'string') {
      return null
    }
    return { token: parsed.token, user: parseUserResponse(parsed.user) }
  } catch {
    return null
  }
}

export function writeStoredAuth(auth: StoredAuth | null): void {
  if (auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function bootstrapAuthToken(): void {
  const storedAuth = readStoredAuth()
  if (storedAuth?.token) {
    apiClient.setToken(storedAuth.token)
  }
}
