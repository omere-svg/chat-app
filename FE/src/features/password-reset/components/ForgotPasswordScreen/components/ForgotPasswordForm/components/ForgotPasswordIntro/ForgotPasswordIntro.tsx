import { FORGOT_PASSWORD_TEXT } from '../../../../ForgotPasswordScreen.constants.ts'
import { FORGOT_PASSWORD_INTRO_CLASS } from './ForgotPasswordIntro.constants.ts'

export function ForgotPasswordIntro(): React.ReactElement {
  return (
    <>
      <h1>{FORGOT_PASSWORD_TEXT.title}</h1>
      <p className={FORGOT_PASSWORD_INTRO_CLASS.subtitle}>{FORGOT_PASSWORD_TEXT.subtitle}</p>
    </>
  )
}
