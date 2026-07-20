import { Link } from 'react-router-dom'
import { PROFILE_ROUTE } from '@/app/constants/routes.ts'
import { EMAIL_CHANGE_CONFIRM_TEXT } from '../../EmailChangeConfirmScreen.constants.ts'
import { useEmailChangeConfirmContext } from '../../context/useEmailChangeConfirmContext.tsx'
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
      <Link className={CONFIRM_SUCCESS_CLASS.link} to={PROFILE_ROUTE}>
        {EMAIL_CHANGE_CONFIRM_TEXT.backToProfile}
      </Link>
    </>
  )
}
