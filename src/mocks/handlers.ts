import { http, HttpResponse } from 'msw'
import { endpoints } from '../api/endpoints.ts'
import {
  addMessage,
  getDb,
  getUserConversations,
  issueToken,
  paginateMessages,
  resolveUserId,
  userInConversation,
} from './db.ts'
import { jsonApiError } from './jsonApiError.ts'
import { MESSAGE_PAGE_LIMIT } from '../api/constants.ts'
import type { LoginRequest, SendMessageRequest } from '../types/api.ts'

function bearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export const handlers = [
  http.post(endpoints.login, async ({ request }) => {
    const body = (await request.json()) as LoginRequest
    const user = getDb().users.find((u) => u.id === body.userId)
    if (!user) {
      return jsonApiError(404, 'USER_NOT_FOUND', 'User not found')
    }
    const token = issueToken(user.id)
    return HttpResponse.json({ token, user })
  }),

  http.get(endpoints.conversations, ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    if (!userId) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    return HttpResponse.json({ conversations: getUserConversations(userId) })
  }),

  http.get(
    `${endpoints.conversations}/:id/messages`,
    ({ request, params }) => {
      const userId = resolveUserId(bearerToken(request))
      if (!userId) {
        return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
      }

      const conversationId = params.id as string
      if (!userInConversation(userId, conversationId)) {
        return jsonApiError(403, 'FORBIDDEN', 'Not a participant in this conversation')
      }

      const url = new URL(request.url)
      const cursor = url.searchParams.get('cursor')
      const limit = Number(url.searchParams.get('limit') ?? String(MESSAGE_PAGE_LIMIT))

      const result = paginateMessages(conversationId, cursor, limit)
      if ('error' in result) {
        return HttpResponse.json({ error: result.error }, { status: 400 })
      }
      return HttpResponse.json(result)
    },
  ),

  http.post(
    `${endpoints.conversations}/:id/messages`,
    async ({ request, params }) => {
      if (request.headers.get('X-Simulate-Failure') === '1') {
        return jsonApiError(
          500,
          'SIMULATED_SEND_FAILURE',
          'Simulated send failure',
        )
      }

      const userId = resolveUserId(bearerToken(request))
      if (!userId) {
        return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
      }

      const conversationId = params.id as string
      if (!userInConversation(userId, conversationId)) {
        return jsonApiError(403, 'FORBIDDEN', 'Not a participant in this conversation')
      }

      const body = (await request.json()) as SendMessageRequest

      if (!body.body?.trim()) {
        return jsonApiError(400, 'VALIDATION_ERROR', 'Message body is required')
      }

      const message = addMessage(
        conversationId,
        userId,
        body.body.trim(),
        body.clientMessageId,
      )

      return HttpResponse.json({ message }, { status: 201 })
    },
  ),
]
