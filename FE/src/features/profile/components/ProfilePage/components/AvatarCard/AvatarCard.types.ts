import type { ReactNode } from 'react'
import type { useProfileAvatar } from './hooks/useProfileAvatar.ts'

export type AvatarCardProps = {
  name: string
  avatarUrl: string | null
  onUploadFile: (file: File) => void
  onRemove: () => void
  isBusy: boolean
  canRemove: boolean
  uploadLabel: string
  removeLabel: string
  statusMessage: ReactNode
}

export type UseProfileAvatarValue = ReturnType<typeof useProfileAvatar>
