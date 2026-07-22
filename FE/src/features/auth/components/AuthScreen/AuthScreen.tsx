import { AUTH_SCREEN_CLASS, AUTH_SCREEN_TEXT } from './AuthScreen.constants.ts'
import { useAuthScreenContext } from './context/useAuthScreenContext.tsx'
import { AuthEmailField } from './components/AuthEmailField/AuthEmailField.tsx'
import { AuthErrorMessage } from './components/AuthErrorMessage/AuthErrorMessage.tsx'
import { AuthForgotPasswordLink } from './components/AuthForgotPasswordLink/AuthForgotPasswordLink.tsx'
import { AuthModeSwitch } from './components/AuthModeSwitch/AuthModeSwitch.tsx'
import { AuthNameFields } from './components/AuthNameFields/AuthNameFields.tsx'
import { AuthPasswordField } from './components/AuthPasswordField/AuthPasswordField.tsx'
import { AuthSubmit } from './components/AuthSubmit/AuthSubmit.tsx'
import { AuthSubtitle } from './components/AuthSubtitle/AuthSubtitle.tsx'
import './AuthScreen.css'

export function AuthScreen(): React.ReactElement {
  const { handleSubmit } = useAuthScreenContext()

  return (
    <form className={AUTH_SCREEN_CLASS.form} noValidate onSubmit={handleSubmit}>
      <h1>{AUTH_SCREEN_TEXT.appTitle}</h1>
      <AuthSubtitle />
      <AuthNameFields />
      <AuthEmailField />
      <AuthPasswordField />
      <AuthForgotPasswordLink />
      <AuthErrorMessage />
      <AuthSubmit />
      <AuthModeSwitch />
    </form>
  )
}
