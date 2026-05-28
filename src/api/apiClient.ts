import { endpoints } from './endpoints.ts'
import type {
  ApiErrorBody,
  ApiErrorPayload,
  ConversationsResponse,
  LoginRequest,
  LoginResponse,
  MessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '../types/api.ts'

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

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>(endpoints.login, {
      method: 'POST',
      body: request,
    })
  }

  async getConversations(): Promise<ConversationsResponse> {
    return this.request<ConversationsResponse>(endpoints.conversations)
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
    return this.request<MessagesResponse>(url.pathname + url.search)
  }

  async sendMessage(
    conversationId: string,
    request: SendMessageRequest,
    options?: { simulateSendFailure?: boolean },
  ): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>(
      endpoints.conversationMessages(conversationId),
      {
        method: 'POST',
        body: request,
        simulateSendFailure: options?.simulateSendFailure,
      },
    )
  }

  private parseErrorPayload(response: Response, body: unknown): ApiErrorPayload {
    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof (body as ApiErrorBody).error === 'object' &&
      (body as ApiErrorBody).error !== null
    ) {
      const { code, message, details } = (body as ApiErrorBody).error
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
    options: RequestOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    if (options.simulateSendFailure) {
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

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }
}

export const apiClient = new ApiClient()
