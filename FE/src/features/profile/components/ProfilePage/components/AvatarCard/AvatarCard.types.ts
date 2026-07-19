import type { ReactNode } from 'react'
import type { useProfileAvatar } from './hooks/useProfileAvatar.ts'

export type UseProfileAvatarValue = ReturnType<typeof useProfileAvatar>

export type ProfileAvatarProviderProps = {
  children: ReactNode
}
