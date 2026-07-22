import { Link } from 'react-router-dom'
import { FORGOT_PASSWORD_ROUTE } from '@/app/constants/routes.ts'
import {
  AUTH_FORGOT_PASSWORD_CLASS,
  AUTH_FORGOT_PASSWORD_TEXT,
} from './AuthForgotPasswordLink.constants.ts'
import './AuthForgotPasswordLink.css'

export function AuthForgotPasswordLink(): React.ReactElement {
  return (
    <p className={AUTH_FORGOT_PASSWORD_CLASS.wrapper}>
      <Link className={AUTH_FORGOT_PASSWORD_CLASS.link} to={FORGOT_PASSWORD_ROUTE}>
        {AUTH_FORGOT_PASSWORD_TEXT.cta}
      </Link>
    </p>
  )
}
