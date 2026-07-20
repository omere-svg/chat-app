import type { ChangeEvent } from 'react'
import { useProfileAvatarContext } from '../../../context/useProfileAvatarContext.tsx'
import { AVATAR_UPLOAD_TEXT } from '../AvatarUploadControl.constants.ts'

export function useAvatarUpload() {
  const { isSaving, uploadFile } = useProfileAvatarContext()

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file !== undefined) {
      uploadFile(file)
    }
  }

  const label = isSaving ? AVATAR_UPLOAD_TEXT.uploading : AVATAR_UPLOAD_TEXT.upload

  return { isSaving, label, handleFileChange }
}
