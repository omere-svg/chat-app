export const CHAT_TOPBAR_CLASS = {
  topbar: 'chat-layout__topbar',
  user: 'chat-layout__user',
  actions: 'chat-layout__topbar-actions',
  action: 'btn btn--ghost',
} as const

export const CHAT_TOPBAR_TEXT = {
  signedInPrefix: 'Signed in as',
  profile: 'Profile',
  logout: 'Log out',
} as const

export const CHAT_TOPBAR_ROUTE = {
  profile: '/profile',
} as const
