import { PROFILE_PAGE_CLASS } from './ProfilePage.constants.ts'
import type { ProfilePageProps } from './ProfilePage.types.ts'
import { ProfileHeader } from './components/ProfileHeader/ProfileHeader.tsx'
import './ProfilePage.css'

export function ProfilePage({
  avatarCard,
  nameCard,
  emailChangeCard,
  previousEmailsCard,
}: ProfilePageProps): React.ReactElement {
  return (
    <div className={PROFILE_PAGE_CLASS.page}>
      <ProfileHeader />
      {avatarCard}
      {nameCard}
      {emailChangeCard}
      {previousEmailsCard}
    </div>
  )
}
