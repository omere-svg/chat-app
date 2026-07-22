import { PREVIOUS_EMAILS_CARD_CLASS } from '../../../../PreviousEmailsCard.constants.ts'
import type { PreviousEmailsMessageProps } from './PreviousEmailsMessage.types.ts'

export function PreviousEmailsMessage({
  message,
  role,
}: PreviousEmailsMessageProps): React.ReactElement {
  return (
    <p className={PREVIOUS_EMAILS_CARD_CLASS.message} role={role}>
      {message}
    </p>
  )
}
