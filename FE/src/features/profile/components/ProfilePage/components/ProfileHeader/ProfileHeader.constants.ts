import { CHAT_ROUTE } from '@/app/constants/routes.ts'

export const PROFILE_HEADER_CLASS = {
  header: 'profile-header',
  title: 'profile-header__title',
} as const

export const PROFILE_HEADER_TEXT = {
  title: 'Profile',
  backLabel: 'Back to chat',
} as const

export const PROFILE_BACK_LINK_TO = CHAT_ROUTE
