import { AUTH_ERROR_CLASS } from './AuthErrorMessage.constants.ts'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'
import './AuthErrorMessage.css'

export function AuthErrorMessage(): React.ReactElement | null {
  const { errorMessage } = useAuthScreenContext()

  if (errorMessage === null) {
    return null
  }

  return (
    <p className={AUTH_ERROR_CLASS.message} role="alert">
      {errorMessage}
    </p>
  )
}
