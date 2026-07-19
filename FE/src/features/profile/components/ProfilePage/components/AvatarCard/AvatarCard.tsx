import { Button } from '@/shared/components/Button/Button.tsx'
import { UserAvatarContainer } from '@/shared/components/UserAvatar/UserAvatarContainer.tsx'
import { ProfileCard } from '../ProfileCard/ProfileCard.tsx'
import {
  AVATAR_ACCEPT,
  AVATAR_CARD_CLASS,
  AVATAR_CARD_HEADING_ID,
  AVATAR_CARD_INPUT_ID,
  AVATAR_CARD_TEXT,
} from './AvatarCard.constants.ts'
import type { AvatarCardProps } from './AvatarCard.types.ts'
import './AvatarCard.css'

export function AvatarCard({
  name,
  avatarUrl,
  isSaving,
  canRemove,
  uploadLabel,
  removeLabel,
  onFileChange,
  onRemove,
  statusMessage,
}: AvatarCardProps): React.ReactElement {
  return (
    <ProfileCard
      title={AVATAR_CARD_TEXT.title}
      headingId={AVATAR_CARD_HEADING_ID}
      actions={
        <Button
          type="button"
          variant="ghost"
          disabled={!canRemove || isSaving}
          onClick={onRemove}
        >
          {removeLabel}
        </Button>
      }
    >
      <div className={AVATAR_CARD_CLASS.preview}>
        <UserAvatarContainer name={name} imageUrl={avatarUrl} size="lg" />
        <div className={AVATAR_CARD_CLASS.controls}>
          <input
            id={AVATAR_CARD_INPUT_ID}
            className={AVATAR_CARD_CLASS.fileInput}
            type="file"
            accept={AVATAR_ACCEPT}
            disabled={isSaving}
            onChange={onFileChange}
          />
          <label htmlFor={AVATAR_CARD_INPUT_ID} className={AVATAR_CARD_CLASS.uploadLabel}>
            {uploadLabel}
          </label>
        </div>
      </div>
      {statusMessage}
    </ProfileCard>
  )
}
