import { EMAIL_CHANGE_CONFIRM_TEXT } from '../../EmailChangeConfirmScreen.constants.ts'
import { CONFIRM_PENDING_CLASS } from './ConfirmPending.constants.ts'
import './ConfirmPending.css'

export function ConfirmPending(): React.ReactElement {
  return (
    <p className={CONFIRM_PENDING_CLASS.message} role="status">
      {EMAIL_CHANGE_CONFIRM_TEXT.pending}
    </p>
  )
}
