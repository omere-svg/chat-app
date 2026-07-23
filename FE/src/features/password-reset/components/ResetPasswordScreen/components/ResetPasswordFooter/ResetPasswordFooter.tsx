import { Link } from 'react-router-dom'
import { LOGIN_ROUTE } from '@/app/constants/routes.ts'
import {
  RESET_PASSWORD_CLASS,
  RESET_PASSWORD_TEXT,
} from '../../ResetPasswordScreen.constants.ts'

export function ResetPasswordFooter(): React.ReactElement {
  return (
    <p className={RESET_PASSWORD_CLASS.footer}>
      <Link className={RESET_PASSWORD_CLASS.footerLink} to={LOGIN_ROUTE}>
        {RESET_PASSWORD_TEXT.backToLogin}
      </Link>
    </p>
  )
}
