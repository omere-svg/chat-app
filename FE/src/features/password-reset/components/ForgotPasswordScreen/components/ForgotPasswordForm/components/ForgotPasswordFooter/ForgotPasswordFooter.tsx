import { Link } from 'react-router-dom'
import { LOGIN_ROUTE } from '@/app/constants/routes.ts'
import {
  FORGOT_PASSWORD_CLASS,
  FORGOT_PASSWORD_TEXT,
} from '../../../../ForgotPasswordScreen.constants.ts'

export function ForgotPasswordFooter(): React.ReactElement {
  return (
    <p className={FORGOT_PASSWORD_CLASS.footer}>
      <Link className={FORGOT_PASSWORD_CLASS.footerLink} to={LOGIN_ROUTE}>
        {FORGOT_PASSWORD_TEXT.backToLogin}
      </Link>
    </p>
  )
}
