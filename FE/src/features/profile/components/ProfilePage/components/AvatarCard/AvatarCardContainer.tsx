import { FormStatusMessage } from '../FormStatusMessage/FormStatusMessage.tsx'
import { toFormStatusView } from '../FormStatusMessage/FormStatusMessage.utils.ts'
import { AvatarCard } from './AvatarCard.tsx'
import { useProfileAvatar } from './hooks/useProfileAvatar.ts'

export function AvatarCardContainer(): React.ReactElement {
  const {
    name,
    avatarUrl,
    uploadFile,
    removeAvatar,
    isBusy,
    canRemove,
    uploadLabel,
    removeLabel,
    status,
  } = useProfileAvatar()

  const statusMessage = status ? (
    <FormStatusMessage {...toFormStatusView(status)} />
  ) : null

  return (
    <AvatarCard
      name={name}
      avatarUrl={avatarUrl}
      onUploadFile={uploadFile}
      onRemove={removeAvatar}
      isBusy={isBusy}
      canRemove={canRemove}
      uploadLabel={uploadLabel}
      removeLabel={removeLabel}
      statusMessage={statusMessage}
    />
  )
}
