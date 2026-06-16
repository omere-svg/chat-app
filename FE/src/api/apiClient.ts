import { endpoints } from './endpoints.ts'
import {
  isRecord,
  parseAuthResponse,
  parseConversationsResponse,
  parseCreateConversationResponse,
  parseMessagesResponse,
  parseSendMessageResponse,
  parseUserResponse,
} from './parseApiResponse.ts'
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
  simulateSendFailure?: boolean
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
    options?: { simulateSendFailure?: boolean },
  ): Promise<SendMessageResponse> {
    return this.request(
      endpoints.conversationMessages(conversationId),
      parseSendMessageResponse,
      {
        method: 'POST',
        body: request,
        simulateSendFailure: options?.simulateSendFailure,
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

    // Dev-only hook: never send the simulate-failure header in a production build.
    if (import.meta.env.DEV && options.simulateSendFailure) {
      headers['X-Simulate-Failure'] = '1'
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
