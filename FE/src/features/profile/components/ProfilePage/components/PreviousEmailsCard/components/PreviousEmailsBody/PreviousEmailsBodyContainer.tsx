import { usePreviousEmailsContext } from '../../context/usePreviousEmailsContext.tsx'
import { PREVIOUS_EMAILS_CARD_TEXT } from '../../PreviousEmailsCard.constants.ts'
import { PreviousEmailItem } from './components/PreviousEmailItem/PreviousEmailItem.tsx'
import { PreviousEmailsList } from './components/PreviousEmailsList/PreviousEmailsList.tsx'
import { PreviousEmailsMessage } from './components/PreviousEmailsMessage/PreviousEmailsMessage.tsx'

export function PreviousEmailsBodyContainer(): React.ReactElement {
  const { previousEmails, isLoading, hasError } = usePreviousEmailsContext()

  if (isLoading) {
    return <PreviousEmailsMessage message={PREVIOUS_EMAILS_CARD_TEXT.loading} />
  }

  if (hasError) {
    return <PreviousEmailsMessage message={PREVIOUS_EMAILS_CARD_TEXT.error} role="alert" />
  }

  if (previousEmails.length === 0) {
    return <PreviousEmailsMessage message={PREVIOUS_EMAILS_CARD_TEXT.empty} />
  }

  const items = [...previousEmails].reverse().map((email, index) => (
    <PreviousEmailItem key={`${email}-${index.toString()}`} email={email} />
  ))

  return <PreviousEmailsList items={items} />
}
