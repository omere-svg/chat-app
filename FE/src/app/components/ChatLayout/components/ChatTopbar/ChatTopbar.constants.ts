import { PROFILE_ROUTE } from '@/app/constants/routes.ts'

export const CHAT_TOPBAR_CLASS = {
  topbar: 'chat-layout__topbar',
  identity: 'chat-layout__identity',
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
  profile: PROFILE_ROUTE,
} as const
