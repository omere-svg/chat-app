import { apiClient, ApiError } from '@/api/apiClient.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { useProfileForm } from '@/features/profile/components/ProfilePage/hooks/useProfileForm.ts'
import { fullName } from '@/types/domain.utils.ts'
import {
  ALLOWED_AVATAR_CONTENT_TYPES,
  AVATAR_CARD_TEXT,
  MAX_AVATAR_BYTES,
} from '../AvatarCard.constants.ts'
import { REMOVE_AVATAR_TEXT } from '../components/RemoveAvatarButton/RemoveAvatarButton.constants.ts'

function isAllowedContentType(contentType: string): boolean {
  return (ALLOWED_AVATAR_CONTENT_TYPES as readonly string[]).includes(contentType)
}

export function useProfileAvatar() {
  const { currentUser, updateCurrentUser } = useAuth()
  const { isSaving, statusView, runSave } = useProfileForm()

  const name = currentUser ? fullName(currentUser) : ''
  const avatarUrl = currentUser?.avatarUrl ?? null

  function uploadFile(file: File): void {
    if (isSaving) {
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
      await apiClient.uploadAvatarToStorage(ticket, file)
      const { avatarUrl: uploadedAvatarUrl } = await apiClient.setAvatar(ticket.key)
      if (currentUser) {
        updateCurrentUser({ ...currentUser, avatarUrl: uploadedAvatarUrl })
      }
      return AVATAR_CARD_TEXT.uploadSuccess
    })
  }

  function removeAvatar(): void {
    if (isSaving || avatarUrl === null) {
      return
    }
    void runSave(async () => {
      const { avatarUrl: clearedAvatarUrl } = await apiClient.removeAvatar()
      if (currentUser) {
        updateCurrentUser({ ...currentUser, avatarUrl: clearedAvatarUrl })
      }
      return AVATAR_CARD_TEXT.removeSuccess
    })
  }

  return {
    name,
    avatarUrl,
    isSaving,
    canRemove: avatarUrl !== null,
    removeLabel: isSaving ? REMOVE_AVATAR_TEXT.removing : REMOVE_AVATAR_TEXT.remove,
    uploadFile,
    removeAvatar,
    statusView,
  }
}
