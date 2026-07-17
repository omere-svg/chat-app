import { EmailCardContainer } from './components/EmailCard/EmailCardContainer.tsx'
import { NameCardContainer } from './components/NameCard/NameCardContainer.tsx'
import { ProfilePage } from './ProfilePage.tsx'

export function ProfilePageContainer(): React.ReactElement {
  return (
    <ProfilePage
      nameCard={<NameCardContainer />}
      emailCard={<EmailCardContainer />}
    />
  )
}
