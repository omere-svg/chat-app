import { endpoints } from './endpoints.ts'
import { consumeAssistantStream } from './assistantStream.ts'
import {
  isRecord,
  parseAuthResponse,
  parseConversationsResponse,
  parseCreateConversationResponse,
  parseMessagesResponse,
  parseSendMessageResponse,
  parseUserResponse,
} from './parseApiResponse.ts'
import type { AssistantStreamHandlers } from './assistantStream.ts'
import type {
  ApiErrorPayload,
  AuthResponse,
  ConversationsResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  LoginRequest,
  MessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  SignupRequest,
} from '../types/api.ts'
import type { User } from '../types/domain.ts'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.status = status
    this.code = payload.code
    this.details = payload.details
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
}

class ApiClient {
  private token: string | null = null
  private unauthorizedHandler: (() => void) | null = null

  setToken(token: string | null): void {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }

  setUnauthorizedHandler(handler: (() => void) | null): void {
    this.unauthorizedHandler = handler
  }

  async signup(request: SignupRequest): Promise<AuthResponse> {
    return this.request(endpoints.signup, parseAuthResponse, {
      method: 'POST',
      body: request,
    })
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    return this.request(endpoints.login, parseAuthResponse, {
      method: 'POST',
      body: request,
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request(endpoints.currentUser, parseUserResponse)
  }

  async getConversations(): Promise<ConversationsResponse> {
    return this.request(endpoints.conversations, parseConversationsResponse)
  }

  async createConversation(
    request: CreateConversationRequest,
  ): Promise<CreateConversationResponse> {
    return this.request(
      endpoints.conversations,
      parseCreateConversationResponse,
      {
        method: 'POST',
        body: request,
      },
    )
  }

  async createAssistantConversation(title?: string): Promise<CreateConversationResponse> {
    return this.request(endpoints.conversations, parseCreateConversationResponse, {
      method: 'POST',
      body: { type: 'assistant', ...(title === undefined ? {} : { title }) },
    })
  }

  // Posts a message to an assistant conversation and consumes the SSE reply stream.
  // Pre-stream failures throw ApiError (handled like any request); in-stream failures
  // arrive as an `error` event delivered to handlers.onError.
  async streamAssistantMessage(
    conversationId: string,
    request: SendMessageRequest,
    handlers: AssistantStreamHandlers & { signal?: AbortSignal },
  ): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(endpoints.conversationMessages(conversationId), {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: handlers.signal,
    })

    if (!response.ok) {
      let errorPayload: ApiErrorPayload
      try {
        errorPayload = this.parseErrorPayload(response, await response.json())
      } catch {
        errorPayload = { code: 'HTTP_ERROR', message: response.statusText || 'Request failed' }
      }
      if (response.status === 401) {
        this.token = null
        this.unauthorizedHandler?.()
      }
      throw new ApiError(response.status, errorPayload)
    }

    await consumeAssistantStream(response, handlers)
  }

  async getMessages(
    conversationId: string,
    params?: { cursor?: string; limit?: number },
  ): Promise<MessagesResponse> {
    const url = new URL(
      endpoints.conversationMessages(conversationId),
      window.location.origin,
    )
    if (params?.cursor) {
      url.searchParams.set('cursor', params.cursor)
    }
    if (params?.limit !== undefined) {
      url.searchParams.set('limit', String(params.limit))
    }
    return this.request(url.pathname + url.search, parseMessagesResponse)
  }

  async sendMessage(
    conversationId: string,
    request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    return this.request(
      endpoints.conversationMessages(conversationId),
      parseSendMessageResponse,
      {
        method: 'POST',
        body: request,
      },
    )
  }

  private parseErrorPayload(response: Response, body: unknown): ApiErrorPayload {
    if (isRecord(body) && isRecord(body.error)) {
      const { code, message, details } = body.error
      if (typeof code === 'string' && typeof message === 'string') {
        return { code, message, details }
      }
    }
    return {
      code: 'HTTP_ERROR',
      message: response.statusText || 'Request failed',
    }
  }

  private async request<T>(
    path: string,
    parseResponse: (rawBody: unknown) => T,
    options: RequestOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      let errorPayload: ApiErrorPayload
      try {
        errorPayload = this.parseErrorPayload(
          response,
          await response.json(),
        )
      } catch {
        errorPayload = {
          code: 'HTTP_ERROR',
          message: response.statusText || 'Request failed',
        }
      }

      if (response.status === 401) {
        this.token = null
        this.unauthorizedHandler?.()
      }

      throw new ApiError(response.status, errorPayload)
    }

    return parseResponse(await response.json())
  }
}

export const apiClient = new ApiClient()
