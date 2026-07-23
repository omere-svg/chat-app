import { EMAIL_CHANGE_CONFIRM_TEXT } from '../../EmailChangeConfirmScreen.constants.ts'
import { useEmailChangeConfirmContext } from '../../context/useEmailChangeConfirmContext.tsx'
import { BackToProfileLink } from '../BackToProfileLink/BackToProfileLink.tsx'
import { CONFIRM_SUCCESS_CLASS } from './ConfirmSuccess.constants.ts'
import './ConfirmSuccess.css'

export function ConfirmSuccess(): React.ReactElement {
  const { newEmail } = useEmailChangeConfirmContext()

  return (
    <>
      <p className={CONFIRM_SUCCESS_CLASS.message} role="status">
        {EMAIL_CHANGE_CONFIRM_TEXT.successPrefix}
        <strong>{newEmail}</strong>
      </p>
      <BackToProfileLink />
    </>
  )
}
