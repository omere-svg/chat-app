import { RESET_PASSWORD_TEXT } from '../../ResetPasswordScreen.constants.ts'
import { ResetPasswordFooter } from '../ResetPasswordFooter/ResetPasswordFooter.tsx'
import { RESET_PASSWORD_SUCCESS_CLASS } from './ResetPasswordSuccess.constants.ts'
import './ResetPasswordSuccess.css'

export function ResetPasswordSuccess(): React.ReactElement {
  return (
    <section className={RESET_PASSWORD_SUCCESS_CLASS.root}>
      <h1>{RESET_PASSWORD_TEXT.successTitle}</h1>
      <p role="status">{RESET_PASSWORD_TEXT.successMessage}</p>
      <ResetPasswordFooter />
    </section>
  )
}
