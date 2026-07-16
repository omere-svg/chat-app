const API_BASE = '/api'

export const endpoints = {
  signup: `${API_BASE}/auth/signup`,
  login: `${API_BASE}/auth/login`,
  currentUser: `${API_BASE}/me`,
  updateProfile: `${API_BASE}/me/profile`,
  updateEmail: `${API_BASE}/me/email`,
  conversations: `${API_BASE}/conversations`,
  conversationMessages: (id: string): string =>
    `${API_BASE}/conversations/${id}/messages`,
  knowledgeDocuments: `${API_BASE}/knowledge/documents`,
  knowledgeDocument: (id: string): string => `${API_BASE}/knowledge/documents/${id}`,
} as const
