import { AuthErrorMessage } from './components/AuthErrorMessage/AuthErrorMessage.tsx'
import { AuthForgotPasswordLink } from './components/AuthForgotPasswordLink/AuthForgotPasswordLink.tsx'
import { AuthModeSwitch } from './components/AuthModeSwitch/AuthModeSwitch.tsx'
import { AuthNameFields } from './components/AuthNameFields/AuthNameFields.tsx'
import { AuthScreen } from './AuthScreen.tsx'
import { useAuthScreen } from './hooks/useAuthScreen.ts'

export function AuthScreenContainer(): React.ReactElement {
  const {
    isSignup,
    subtitle,
    copy,
    email,
    password,
    firstName,
    lastName,
    setEmail,
    setPassword,
    setFirstName,
    setLastName,
    isSubmitting,
    errorMessage,
    canSubmit,
    submitLabel,
    passwordAutoComplete,
    handleSubmit,
    toggleMode,
  } = useAuthScreen()

  const nameFields = isSignup ? (
    <AuthNameFields
      firstName={firstName}
      lastName={lastName}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      disabled={isSubmitting}
    />
  ) : null

  const errorNode = errorMessage ? (
    <AuthErrorMessage message={errorMessage} />
  ) : null

  const forgotPasswordLink = isSignup ? null : <AuthForgotPasswordLink />

  const modeSwitch = (
    <AuthModeSwitch
      prompt={copy.switchPrompt}
      cta={copy.switchCta}
      disabled={isSubmitting}
      onToggle={toggleMode}
    />
  )

  return (
    <AuthScreen
      subtitle={subtitle}
      nameFields={nameFields}
      email={email}
      password={password}
      passwordAutoComplete={passwordAutoComplete}
      areInputsDisabled={isSubmitting}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      forgotPasswordLink={forgotPasswordLink}
      errorMessage={errorNode}
      submitLabel={submitLabel}
      isSubmitDisabled={!canSubmit || isSubmitting}
      onSubmit={handleSubmit}
      modeSwitch={modeSwitch}
    />
  )
}
