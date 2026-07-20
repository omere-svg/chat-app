import { ProfileCard } from '../ProfileCard/ProfileCard.tsx'
import { CurrentEmail } from './components/CurrentEmail/CurrentEmail.tsx'
import { EmailChangeRequestStatus } from './components/EmailChangeRequestStatus/EmailChangeRequestStatus.tsx'
import { NewEmailField } from './components/NewEmailField/NewEmailField.tsx'
import { SendConfirmationButton } from './components/SendConfirmationButton/SendConfirmationButton.tsx'
import { useEmailChangeRequestContext } from './context/useEmailChangeRequestContext.tsx'
import {
  EMAIL_CHANGE_REQUEST_CARD_HEADING_ID,
  EMAIL_CHANGE_REQUEST_CARD_TEXT,
} from './EmailChangeRequestCard.constants.ts'

export function EmailChangeRequestCard(): React.ReactElement {
  const { handleSubmit } = useEmailChangeRequestContext()

  return (
    <ProfileCard
      title={EMAIL_CHANGE_REQUEST_CARD_TEXT.title}
      headingId={EMAIL_CHANGE_REQUEST_CARD_HEADING_ID}
      onSubmit={handleSubmit}
      actions={<SendConfirmationButton />}
    >
      <CurrentEmail />
      <NewEmailField />
      <EmailChangeRequestStatus />
    </ProfileCard>
  )
}
