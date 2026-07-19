import { ProfileCard } from '../ProfileCard/ProfileCard.tsx'
import { AvatarPreview } from './components/AvatarPreview/AvatarPreview.tsx'
import { AvatarUploadControl } from './components/AvatarUploadControl/AvatarUploadControl.tsx'
import { RemoveAvatarButton } from './components/RemoveAvatarButton/RemoveAvatarButton.tsx'
import { AvatarStatus } from './components/AvatarStatus/AvatarStatus.tsx'
import {
  AVATAR_CARD_CLASS,
  AVATAR_CARD_HEADING_ID,
  AVATAR_CARD_TEXT,
} from './AvatarCard.constants.ts'
import './AvatarCard.css'

export function AvatarCard(): React.ReactElement {
  return (
    <ProfileCard
      title={AVATAR_CARD_TEXT.title}
      headingId={AVATAR_CARD_HEADING_ID}
      actions={<RemoveAvatarButton />}
    >
      <div className={AVATAR_CARD_CLASS.preview}>
        <AvatarPreview />
        <AvatarUploadControl />
      </div>
      <AvatarStatus />
    </ProfileCard>
  )
}
