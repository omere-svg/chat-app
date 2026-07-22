import {
  RESET_PASSWORD_CLASS,
  RESET_PASSWORD_TEXT,
} from '../../../../ResetPasswordScreen.constants.ts'

export function ResetPasswordFormHeader(): React.ReactElement {
  return (
    <>
      <h1>{RESET_PASSWORD_TEXT.title}</h1>
      <p className={RESET_PASSWORD_CLASS.notice} role="status">
        {RESET_PASSWORD_TEXT.notice}
      </p>
    </>
  )
}
