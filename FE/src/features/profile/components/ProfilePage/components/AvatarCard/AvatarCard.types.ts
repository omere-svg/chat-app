import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import type { FormStatus } from '@/features/profile/types/formStatus.ts'

export type AvatarCardProps = {
  name: string
  avatarUrl: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onSelectFile: (event: ChangeEvent<HTMLInputElement>) => void
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
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  handleSelectFile: (event: ChangeEvent<HTMLInputElement>) => void
  handleRemove: () => void
  isBusy: boolean
  canRemove: boolean
  uploadLabel: string
  removeLabel: string
  status: FormStatus
}
