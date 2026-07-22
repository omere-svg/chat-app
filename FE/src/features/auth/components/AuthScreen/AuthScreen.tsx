import { AUTH_SCREEN_CLASS } from './AuthScreen.constants.ts'
import { useAuthScreenContext } from './context/useAuthScreenContext.tsx'
import { AuthTitle } from './components/AuthTitle/AuthTitle.tsx'
import { AuthEmailField } from './components/AuthEmailField/AuthEmailField.tsx'
import { AuthErrorMessageContainer } from './components/AuthErrorMessage/AuthErrorMessageContainer.tsx'
import { AuthForgotPasswordLinkContainer } from './components/AuthForgotPasswordLink/AuthForgotPasswordLinkContainer.tsx'
import { AuthModeSwitch } from './components/AuthModeSwitch/AuthModeSwitch.tsx'
import { AuthNameFieldsContainer } from './components/AuthNameFields/AuthNameFieldsContainer.tsx'
import { AuthPasswordField } from './components/AuthPasswordField/AuthPasswordField.tsx'
import { AuthSubmit } from './components/AuthSubmit/AuthSubmit.tsx'
import { AuthSubtitle } from './components/AuthSubtitle/AuthSubtitle.tsx'
import './AuthScreen.css'

export function AuthScreen(): React.ReactElement {
  const { handleSubmit } = useAuthScreenContext()

  return (
    <form className={AUTH_SCREEN_CLASS.form} noValidate onSubmit={handleSubmit}>
      <AuthTitle />
      <AuthSubtitle />
      <AuthNameFieldsContainer />
      <AuthEmailField />
      <AuthPasswordField />
      <AuthForgotPasswordLinkContainer />
      <AuthErrorMessageContainer />
      <AuthSubmit />
      <AuthModeSwitch />
    </form>
  )
}
