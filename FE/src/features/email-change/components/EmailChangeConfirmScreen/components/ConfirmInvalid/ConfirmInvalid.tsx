import { Link } from 'react-router-dom'
import { PROFILE_ROUTE } from '@/app/constants/routes.ts'
import { EMAIL_CHANGE_CONFIRM_TEXT } from '../../EmailChangeConfirmScreen.constants.ts'
import { useEmailChangeConfirmContext } from '../../context/useEmailChangeConfirmContext.tsx'
import { CONFIRM_INVALID_CLASS } from './ConfirmInvalid.constants.ts'
import './ConfirmInvalid.css'

export function ConfirmInvalid(): React.ReactElement {
  const { failureMessage } = useEmailChangeConfirmContext()

  return (
    <>
      <p className={CONFIRM_INVALID_CLASS.message} role="alert">
        {failureMessage}
      </p>
      <Link className={CONFIRM_INVALID_CLASS.link} to={PROFILE_ROUTE}>
        {EMAIL_CHANGE_CONFIRM_TEXT.backToProfile}
      </Link>
    </>
  )
}
