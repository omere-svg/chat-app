import {
  PREVIOUS_EMAILS_CARD_CLASS,
  PREVIOUS_EMAILS_CARD_HEADING_ID,
  PREVIOUS_EMAILS_CARD_TEXT,
} from './PreviousEmailsCard.constants.ts'
import type { PreviousEmailsCardProps } from './PreviousEmailsCard.types.ts'
import './PreviousEmailsCard.css'

export function PreviousEmailsCard({ children }: PreviousEmailsCardProps): React.ReactElement {
  return (
    <section
      className={PREVIOUS_EMAILS_CARD_CLASS.card}
      aria-labelledby={PREVIOUS_EMAILS_CARD_HEADING_ID}
    >
      <h2 id={PREVIOUS_EMAILS_CARD_HEADING_ID} className={PREVIOUS_EMAILS_CARD_CLASS.title}>
        {PREVIOUS_EMAILS_CARD_TEXT.title}
      </h2>
      {children}
    </section>
  )
}
