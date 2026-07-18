import type { ReactNode } from 'react'
import type { FormStatus } from '@/features/profile/types/formStatus.ts'

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

export type UseProfileAvatarValue = {
  name: string
  avatarUrl: string | null
  uploadFile: (file: File) => void
  removeAvatar: () => void
  isBusy: boolean
  canRemove: boolean
  uploadLabel: string
  removeLabel: string
  status: FormStatus
}
