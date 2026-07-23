import { PROFILE_PAGE_CLASS } from './ProfilePage.constants.ts'
import { ProfileHeader } from './components/ProfileHeader/ProfileHeader.tsx'
import { AvatarCardContainer } from './components/AvatarCard/AvatarCardContainer.tsx'
import { NameCardContainer } from './components/NameCard/NameCardContainer.tsx'
import { EmailChangeRequestCardContainer } from './components/EmailChangeRequestCard/EmailChangeRequestCardContainer.tsx'
import { PreviousEmailsCardContainer } from './components/PreviousEmailsCard/PreviousEmailsCardContainer.tsx'
import './ProfilePage.css'

export function ProfilePage(): React.ReactElement {
  return (
    <div className={PROFILE_PAGE_CLASS.page}>
      <ProfileHeader />
      <AvatarCardContainer />
      <NameCardContainer />
      <EmailChangeRequestCardContainer />
      <PreviousEmailsCardContainer />
    </div>
  )
}
