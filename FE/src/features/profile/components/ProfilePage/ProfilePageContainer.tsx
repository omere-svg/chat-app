import { AvatarCardContainer } from './components/AvatarCard/AvatarCardContainer.tsx'
import { EmailCardContainer } from './components/EmailCard/EmailCardContainer.tsx'
import { NameCardContainer } from './components/NameCard/NameCardContainer.tsx'
import { ProfilePage } from './ProfilePage.tsx'

export function ProfilePageContainer(): React.ReactElement {
  return (
    <ProfilePage
      avatarCard={<AvatarCardContainer />}
      nameCard={<NameCardContainer />}
      emailCard={<EmailCardContainer />}
    />
  )
}
