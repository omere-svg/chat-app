import { randomUUID } from 'node:crypto'
import { store } from '../../data/store.js'
import { ApiError } from '../../shared/ApiError.js'
import type { User } from '../../domain/types.js'

export type LoginResult = {
  token: string
  user: User
}

export function login(userId: string): LoginResult {
  const user = store.users.get(userId)
  if (!user) {
    throw ApiError.userNotFound()
  }

  const token = issueToken(user.id)
  return { token, user }
}

export function resolveUserId(token: string): string | null {
  return store.userIdByToken.get(token) ?? null
}

function issueToken(userId: string): string {
  const token = `token-${userId}-${randomUUID()}`
  store.userIdByToken.set(token, userId)
  return token
}
