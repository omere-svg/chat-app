import type { ChangeEvent } from 'react'
import { FormStatusMessage } from '../FormStatusMessage/FormStatusMessage.tsx'
import { toFormStatusView } from '../FormStatusMessage/FormStatusMessage.utils.ts'
import { AvatarCard } from './AvatarCard.tsx'
import { AVATAR_CARD_TEXT } from './AvatarCard.constants.ts'
import { useProfileAvatar } from './hooks/useProfileAvatar.ts'

export function AvatarCardContainer(): React.ReactElement {
  const { name, avatarUrl, isSaving, canRemove, uploadFile, removeAvatar, status } =
    useProfileAvatar()

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file !== undefined) {
      uploadFile(file)
    }
  }

  const statusMessage = status ? (
    <FormStatusMessage {...toFormStatusView(status)} />
  ) : null

  return (
    <AvatarCard
      name={name}
      avatarUrl={avatarUrl}
      isSaving={isSaving}
      canRemove={canRemove}
      uploadLabel={isSaving ? AVATAR_CARD_TEXT.uploading : AVATAR_CARD_TEXT.upload}
      removeLabel={isSaving ? AVATAR_CARD_TEXT.removing : AVATAR_CARD_TEXT.remove}
      onFileChange={handleFileChange}
      onRemove={removeAvatar}
      statusMessage={statusMessage}
    />
  )
}
