import { http, HttpResponse } from 'msw'
import { endpoints } from '../api/endpoints.ts'
import { isRecord } from '../api/parseApiResponse.ts'
import {
  addMessage,
  createUser,
  findUserById,
  getUserConversations,
  issueToken,
  paginateMessages,
  resolveUserId,
  toPublicUser,
  updateUserEmail,
  updateUserName,
  userInConversation,
  verifyCredentials,
} from './db.ts'
import { jsonApiError } from './jsonApiError.ts'
import { MESSAGE_PAGE_LIMIT } from '../api/constants.ts'

function bearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

function readPathParam(
  value: string | readonly string[] | undefined,
): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return null
}

export const handlers = [
  http.post(endpoints.signup, async ({ request }) => {
    const body = await request.json()
    if (
      !isRecord(body) ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      typeof body.firstName !== 'string' ||
      typeof body.lastName !== 'string'
    ) {
      return jsonApiError(400, 'VALIDATION_ERROR', 'Invalid signup request')
    }
    const result = createUser({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
    })
    if ('error' in result) {
      return jsonApiError(
        409,
        'EMAIL_ALREADY_REGISTERED',
        'Email is already registered',
      )
    }
    const token = issueToken(result.user.id)
    return HttpResponse.json(
      { token, user: toPublicUser(result.user) },
      { status: 201 },
    )
  }),

  http.post(endpoints.login, async ({ request }) => {
    const body = await request.json()
    if (
      !isRecord(body) ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string'
    ) {
      return jsonApiError(400, 'VALIDATION_ERROR', 'Invalid login request')
    }
    const user = verifyCredentials(body.email, body.password)
    if (!user) {
      return jsonApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }
    const token = issueToken(user.id)
    return HttpResponse.json({ token, user: toPublicUser(user) })
  }),

  http.get(endpoints.currentUser, ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    const user = userId ? findUserById(userId) : null
    if (!user) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    return HttpResponse.json(toPublicUser(user))
  }),

  http.patch(endpoints.updateProfile, async ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    if (!userId) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    const body = await request.json()
    if (
      !isRecord(body) ||
      typeof body.firstName !== 'string' ||
      typeof body.lastName !== 'string' ||
      body.firstName.trim().length === 0 ||
      body.lastName.trim().length === 0
    ) {
      return jsonApiError(400, 'VALIDATION_ERROR', 'Invalid profile update request')
    }
    const user = updateUserName(userId, body.firstName, body.lastName)
    if (!user) {
      return jsonApiError(404, 'USER_NOT_FOUND', 'User not found')
    }
    return HttpResponse.json(toPublicUser(user))
  }),

  http.patch(endpoints.updateEmail, async ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    if (!userId) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    const body = await request.json()
    if (
      !isRecord(body) ||
      typeof body.email !== 'string' ||
      typeof body.currentPassword !== 'string' ||
      body.currentPassword.length === 0
    ) {
      return jsonApiError(400, 'VALIDATION_ERROR', 'Invalid email update request')
    }
    const result = updateUserEmail(userId, body.email, body.currentPassword)
    if ('error' in result) {
      if (result.error === 'INVALID_CREDENTIALS') {
        return jsonApiError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect')
      }
      return jsonApiError(409, 'EMAIL_ALREADY_REGISTERED', 'Email is already registered')
    }
    return HttpResponse.json(toPublicUser(result.user))
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

      const conversationId = readPathParam(params.id)
      if (!conversationId) {
        return jsonApiError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
      }
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
      const userId = resolveUserId(bearerToken(request))
      if (!userId) {
        return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
      }

      const conversationId = readPathParam(params.id)
      if (!conversationId) {
        return jsonApiError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
      }
      if (!userInConversation(userId, conversationId)) {
        return jsonApiError(403, 'FORBIDDEN', 'Not a participant in this conversation')
      }

      const body = await request.json()
      if (!isRecord(body)) {
        return jsonApiError(400, 'VALIDATION_ERROR', 'Invalid request body')
      }

      const messageBody = typeof body.body === 'string' ? body.body.trim() : ''
      if (!messageBody) {
        return jsonApiError(400, 'VALIDATION_ERROR', 'Message body is required')
      }

      const clientMessageId =
        typeof body.clientMessageId === 'string'
          ? body.clientMessageId
          : undefined

      const message = addMessage(
        conversationId,
        userId,
        messageBody,
        clientMessageId,
      )

      return HttpResponse.json({ message }, { status: 201 })
    },
  ),
]
