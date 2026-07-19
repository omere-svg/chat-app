import type { ReactNode } from 'react'

export type UserAvatarSize = 'sm' | 'md' | 'lg'

export type UserAvatarProps = {
  imageUrl: string | null
  label: string
  fallback: ReactNode
  size: UserAvatarSize
}

export type UserAvatarContainerProps = {
  name: string
  imageUrl?: string | null
  size?: UserAvatarSize
}
