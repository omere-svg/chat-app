import { http, HttpResponse } from 'msw'
import { endpoints } from '../api/endpoints.ts'
import { isRecord } from '../api/parseApiResponse.ts'
import {
  addMessage,
  clearUserAvatar,
  confirmEmailChange,
  createUser,
  findUserById,
  getPreviousEmails,
  getUserConversations,
  isOwnedAvatarKey,
  issueToken,
  paginateMessages,
  requestEmailChange,
  resolveUserId,
  setUserAvatar,
  toPublicUser,
  updateUserName,
  userInConversation,
  verifyCredentials,
} from './db.ts'
import { jsonApiError } from './jsonApiError.ts'
import {
  EMAIL_CHANGE_REQUEST_STATUS,
  MESSAGE_PAGE_LIMIT,
} from '../api/constants.ts'
import { isValidEmail } from '../shared/validation/isValidEmail.ts'

const MOCK_ALLOWED_AVATAR_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MOCK_AVATAR_STORAGE_ORIGIN = 'https://mock-avatar-storage.local'

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

  http.get(endpoints.previousEmails, ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    if (!userId) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    const previousEmails = getPreviousEmails(userId)
    if (previousEmails === null) {
      return jsonApiError(404, 'USER_NOT_FOUND', 'User not found')
    }
    return HttpResponse.json({ previousEmails })
  }),

  http.post(endpoints.emailChangeRequest, async ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    if (!userId) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    const body = await request.json()
    if (
      !isRecord(body) ||
      typeof body.newEmail !== 'string' ||
      !isValidEmail(body.newEmail)
    ) {
      return jsonApiError(400, 'VALIDATION_ERROR', 'Invalid email change request')
    }
    const result = requestEmailChange(userId, body.newEmail)
    if ('error' in result) {
      if (result.error === 'VALIDATION_ERROR') {
        return jsonApiError(400, 'VALIDATION_ERROR', 'The new email must be different')
      }
      return jsonApiError(409, 'EMAIL_ALREADY_REGISTERED', 'Email is already registered')
    }
    return HttpResponse.json(
      { status: EMAIL_CHANGE_REQUEST_STATUS },
      { status: 202 },
    )
  }),

  http.post(endpoints.emailChangeConfirm, async ({ request }) => {
    const body = await request.json()
    if (!isRecord(body) || typeof body.token !== 'string' || body.token.length === 0) {
      return jsonApiError(400, 'EMAIL_CHANGE_TOKEN_INVALID', 'Invalid confirmation token')
    }
    const result = confirmEmailChange(body.token)
    if ('error' in result) {
      if (result.error === 'EMAIL_CHANGE_TOKEN_INVALID') {
        return jsonApiError(400, 'EMAIL_CHANGE_TOKEN_INVALID', 'Invalid or expired token')
      }
      return jsonApiError(409, 'EMAIL_ALREADY_REGISTERED', 'Email is already registered')
    }
    return HttpResponse.json(toPublicUser(result.user))
  }),

  http.post(endpoints.avatarUploadUrl, async ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    if (!userId) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    const body = await request.json()
    const contentType =
      isRecord(body) && typeof body.contentType === 'string' ? body.contentType : ''
    if (!MOCK_ALLOWED_AVATAR_CONTENT_TYPES.includes(contentType)) {
      return jsonApiError(400, 'UNSUPPORTED_IMAGE_TYPE', 'Unsupported image type')
    }
    const key = `avatars/${userId}`
    return HttpResponse.json({
      url: MOCK_AVATAR_STORAGE_ORIGIN,
      fields: { key, 'Content-Type': contentType },
      key,
      expiresInSeconds: 300,
    })
  }),

  http.post(MOCK_AVATAR_STORAGE_ORIGIN, () => new HttpResponse(null, { status: 204 })),

  http.put(endpoints.avatar, async ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    if (!userId) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    const body = await request.json()
    const key = isRecord(body) && typeof body.key === 'string' ? body.key : ''
    if (!isOwnedAvatarKey(userId, key)) {
      return jsonApiError(403, 'FORBIDDEN', 'Avatar key does not belong to this user')
    }
    const user = setUserAvatar(userId, key)
    if (!user) {
      return jsonApiError(404, 'USER_NOT_FOUND', 'User not found')
    }
    return HttpResponse.json({ avatarUrl: toPublicUser(user).avatarUrl })
  }),

  http.delete(endpoints.avatar, ({ request }) => {
    const userId = resolveUserId(bearerToken(request))
    if (!userId) {
      return jsonApiError(401, 'UNAUTHORIZED', 'Missing or invalid token')
    }
    const user = clearUserAvatar(userId)
    if (!user) {
      return jsonApiError(404, 'USER_NOT_FOUND', 'User not found')
    }
    return HttpResponse.json({ avatarUrl: toPublicUser(user).avatarUrl })
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
