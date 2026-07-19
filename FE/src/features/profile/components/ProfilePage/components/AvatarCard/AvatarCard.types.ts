import type { ChangeEvent, ReactNode } from 'react'
import type { useProfileAvatar } from './hooks/useProfileAvatar.ts'

export type UseProfileAvatarValue = ReturnType<typeof useProfileAvatar>

export type AvatarCardProps = Pick<
  UseProfileAvatarValue,
  'name' | 'avatarUrl' | 'isSaving' | 'canRemove'
> & {
  uploadLabel: string
  removeLabel: string
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  statusMessage: ReactNode
}
