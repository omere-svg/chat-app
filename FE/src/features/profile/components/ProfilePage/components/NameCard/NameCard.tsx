import { ProfileCard } from '../ProfileCard/ProfileCard.tsx'
import { NameFirstNameField } from './components/NameFirstNameField/NameFirstNameField.tsx'
import { NameLastNameField } from './components/NameLastNameField/NameLastNameField.tsx'
import { NameStatus } from './components/NameStatus/NameStatus.tsx'
import { NameSubmit } from './components/NameSubmit/NameSubmit.tsx'
import { useProfileNameContext } from './context/useProfileNameContext.tsx'
import { NAME_CARD_HEADING_ID, NAME_CARD_TEXT } from './NameCard.constants.ts'

export function NameCard(): React.ReactElement {
  const { handleSubmit } = useProfileNameContext()

  return (
    <ProfileCard
      title={NAME_CARD_TEXT.title}
      headingId={NAME_CARD_HEADING_ID}
      onSubmit={handleSubmit}
      actions={<NameSubmit />}
    >
      <NameFirstNameField />
      <NameLastNameField />
      <NameStatus />
    </ProfileCard>
  )
}
