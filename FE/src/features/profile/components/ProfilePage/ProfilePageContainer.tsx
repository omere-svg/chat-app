import { AvatarCardContainer } from './components/AvatarCard/AvatarCardContainer.tsx'
import { EmailChangeRequestCardContainer } from './components/EmailChangeRequestCard/EmailChangeRequestCardContainer.tsx'
import { NameCardContainer } from './components/NameCard/NameCardContainer.tsx'
import { PreviousEmailsCardContainer } from './components/PreviousEmailsCard/PreviousEmailsCardContainer.tsx'
import { ProfilePage } from './ProfilePage.tsx'

export function ProfilePageContainer(): React.ReactElement {
  return (
    <ProfilePage
      avatarCard={<AvatarCardContainer />}
      nameCard={<NameCardContainer />}
      emailChangeCard={<EmailChangeRequestCardContainer />}
      previousEmailsCard={<PreviousEmailsCardContainer />}
    />
  )
}
