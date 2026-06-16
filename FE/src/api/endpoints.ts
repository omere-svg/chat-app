const API_BASE = '/api'

export const endpoints = {
  signup: `${API_BASE}/auth/signup`,
  login: `${API_BASE}/auth/login`,
  currentUser: `${API_BASE}/me`,
  conversations: `${API_BASE}/conversations`,
  conversationMessages: (id: string): string =>
    `${API_BASE}/conversations/${id}/messages`,
} as const
