import { NameCard } from './NameCard.tsx'
import { ProfileNameProvider } from './context/useProfileNameContext.tsx'

export function NameCardContainer(): React.ReactElement {
  return (
    <ProfileNameProvider>
      <NameCard />
    </ProfileNameProvider>
  )
}
