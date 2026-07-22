import {
  FORGOT_PASSWORD_CLASS,
  FORGOT_PASSWORD_TEXT,
} from '../../../../ForgotPasswordScreen.constants.ts'

export function ForgotPasswordIntro(): React.ReactElement {
  return (
    <>
      <h1>{FORGOT_PASSWORD_TEXT.title}</h1>
      <p className={FORGOT_PASSWORD_CLASS.subtitle}>{FORGOT_PASSWORD_TEXT.subtitle}</p>
    </>
  )
}
