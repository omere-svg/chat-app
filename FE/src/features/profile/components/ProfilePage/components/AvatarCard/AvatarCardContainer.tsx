import { AvatarCard } from './AvatarCard.tsx'
import { ProfileAvatarProvider } from './context/useProfileAvatarContext.tsx'

export function AvatarCardContainer(): React.ReactElement {
  return (
    <ProfileAvatarProvider>
      <AvatarCard />
    </ProfileAvatarProvider>
  )
}
