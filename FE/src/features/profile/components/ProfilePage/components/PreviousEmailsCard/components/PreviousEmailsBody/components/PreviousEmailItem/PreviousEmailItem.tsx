import { PREVIOUS_EMAIL_ITEM_CLASS } from './PreviousEmailItem.constants.ts'
import type { PreviousEmailItemProps } from './PreviousEmailItem.types.ts'
import './PreviousEmailItem.css'

export function PreviousEmailItem({ email }: PreviousEmailItemProps): React.ReactElement {
  return <li className={PREVIOUS_EMAIL_ITEM_CLASS.item}>{email}</li>
}
