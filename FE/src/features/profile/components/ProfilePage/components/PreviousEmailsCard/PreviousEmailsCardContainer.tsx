import type { ReactNode } from 'react'
import { PreviousEmailsCard } from './PreviousEmailsCard.tsx'
import { PreviousEmailItem } from './components/PreviousEmailItem/PreviousEmailItem.tsx'
import { usePreviousEmails } from './hooks/usePreviousEmails.ts'
import {
  PREVIOUS_EMAILS_CARD_CLASS,
  PREVIOUS_EMAILS_CARD_TEXT,
} from './PreviousEmailsCard.constants.ts'

export function PreviousEmailsCardContainer(): React.ReactElement {
  const { previousEmails, isLoading, hasError } = usePreviousEmails()

  let body: ReactNode
  if (isLoading) {
    body = <p className={PREVIOUS_EMAILS_CARD_CLASS.message}>{PREVIOUS_EMAILS_CARD_TEXT.loading}</p>
  } else if (hasError) {
    body = (
      <p className={PREVIOUS_EMAILS_CARD_CLASS.message} role="alert">
        {PREVIOUS_EMAILS_CARD_TEXT.error}
      </p>
    )
  } else if (previousEmails.length === 0) {
    body = <p className={PREVIOUS_EMAILS_CARD_CLASS.message}>{PREVIOUS_EMAILS_CARD_TEXT.empty}</p>
  } else {
    body = (
      <ul className={PREVIOUS_EMAILS_CARD_CLASS.list}>
        {[...previousEmails].reverse().map((email, index) => (
          <PreviousEmailItem key={`${email}-${index.toString()}`} email={email} />
        ))}
      </ul>
    )
  }

  return <PreviousEmailsCard>{body}</PreviousEmailsCard>
}
