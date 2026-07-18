import type { ChangeEvent, FormEvent } from 'react'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { useProfileForm } from '@/features/profile/components/ProfilePage/hooks/useProfileForm.ts'
import { fullName } from '@/types/domain.ts'
import {
  ALLOWED_AVATAR_CONTENT_TYPES,
  AVATAR_CARD_TEXT,
  MAX_AVATAR_BYTES,
} from '../AvatarCard.constants.ts'
import type { UseProfileAvatarValue } from '../AvatarCard.types.ts'

function isAllowedContentType(contentType: string): boolean {
  return (ALLOWED_AVATAR_CONTENT_TYPES as readonly string[]).includes(contentType)
}

export function useProfileAvatar(): UseProfileAvatarValue {
  const { currentUser, updateCurrentUser } = useAuth()
  const { isSaving, status, runSave } = useProfileForm()

  const name = currentUser ? fullName(currentUser) : ''
  const avatarUrl = currentUser?.avatarUrl ?? null

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
  }

  function handleSelectFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined || isSaving) {
      return
    }
    void runSave(async () => {
      if (!isAllowedContentType(file.type)) {
        throw new ApiError(400, {
          code: 'UNSUPPORTED_IMAGE_TYPE',
          message: AVATAR_CARD_TEXT.unsupportedType,
        })
      }
      if (file.size > MAX_AVATAR_BYTES) {
        throw new ApiError(400, {
          code: 'AVATAR_TOO_LARGE',
          message: AVATAR_CARD_TEXT.tooLarge,
        })
      }
      const ticket = await apiClient.requestAvatarUploadUrl(file.type)
      await apiClient.uploadAvatarToStorage(ticket.uploadUrl, file)
      const updatedUser = await apiClient.setAvatar(ticket.key)
      updateCurrentUser(updatedUser)
      return AVATAR_CARD_TEXT.uploadSuccess
    })
  }

  function handleRemove(): void {
    if (isSaving || avatarUrl === null) {
      return
    }
    void runSave(async () => {
      const updatedUser = await apiClient.removeAvatar()
      updateCurrentUser(updatedUser)
      return AVATAR_CARD_TEXT.removeSuccess
    })
  }

  return {
    name,
    avatarUrl,
    handleSubmit,
    handleSelectFile,
    handleRemove,
    isBusy: isSaving,
    canRemove: avatarUrl !== null,
    uploadLabel: isSaving ? AVATAR_CARD_TEXT.uploading : AVATAR_CARD_TEXT.upload,
    removeLabel: isSaving ? AVATAR_CARD_TEXT.removing : AVATAR_CARD_TEXT.remove,
    status,
  }
}
