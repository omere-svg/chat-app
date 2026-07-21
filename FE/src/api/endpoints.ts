const API_BASE = '/api'

export const endpoints = {
  signup: `${API_BASE}/auth/signup`,
  login: `${API_BASE}/auth/login`,
  currentUser: `${API_BASE}/me`,
  updateProfile: `${API_BASE}/me/profile`,
  previousEmails: `${API_BASE}/me/previous-emails`,
  emailChangeRequest: `${API_BASE}/me/email-change/request`,
  emailChangeConfirm: `${API_BASE}/email-change/confirm`,
  avatarUploadUrl: `${API_BASE}/me/avatar/upload-url`,
  avatar: `${API_BASE}/me/avatar`,
  conversations: `${API_BASE}/conversations`,
  conversationMessages: (id: string): string =>
    `${API_BASE}/conversations/${id}/messages`,
  knowledgeDocuments: `${API_BASE}/knowledge/documents`,
  knowledgeDocument: (id: string): string => `${API_BASE}/knowledge/documents/${id}`,
} as const
