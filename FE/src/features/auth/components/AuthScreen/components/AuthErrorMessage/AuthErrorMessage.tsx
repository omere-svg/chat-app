import { AUTH_ERROR_CLASS } from './AuthErrorMessage.constants.ts'
import type { AuthErrorMessageProps } from './AuthErrorMessage.types.ts'
import './AuthErrorMessage.css'

export function AuthErrorMessage({
  message,
}: AuthErrorMessageProps): React.ReactElement {
  return (
    <p className={AUTH_ERROR_CLASS.message} role="alert">
      {message}
    </p>
  )
}
