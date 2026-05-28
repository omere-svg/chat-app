const API_BASE = '/api'

export const endpoints = {
  login: `${API_BASE}/auth/login`,
  conversations: `${API_BASE}/conversations`,
  conversationMessages: (id: string): string =>
    `${API_BASE}/conversations/${id}/messages`,
} as const
