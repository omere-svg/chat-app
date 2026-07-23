import { ProfileCard } from '@/shared/components/ProfileCard/ProfileCard.tsx'
import { AvatarPreviewRow } from './components/AvatarPreviewRow/AvatarPreviewRow.tsx'
import { RemoveAvatarButton } from './components/RemoveAvatarButton/RemoveAvatarButton.tsx'
import { AvatarStatus } from './components/AvatarStatus/AvatarStatus.tsx'
import { AVATAR_CARD_HEADING_ID, AVATAR_CARD_TEXT } from './AvatarCard.constants.ts'
import './AvatarCard.css'

export function AvatarCard(): React.ReactElement {
  return (
    <ProfileCard
      title={AVATAR_CARD_TEXT.title}
      headingId={AVATAR_CARD_HEADING_ID}
      actions={<RemoveAvatarButton />}
    >
      <AvatarPreviewRow />
      <AvatarStatus />
    </ProfileCard>
  )
}
