import { PREVIOUS_EMAILS_CARD_CLASS } from '../../../../PreviousEmailsCard.constants.ts'
import type { PreviousEmailsListProps } from './PreviousEmailsList.types.ts'

export function PreviousEmailsList({ items }: PreviousEmailsListProps): React.ReactElement {
  return <ul className={PREVIOUS_EMAILS_CARD_CLASS.list}>{items}</ul>
}
