import { AUTH_ERROR_CLASS } from './AuthErrorMessage.constants.ts'
import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'
import './AuthErrorMessage.css'

export function AuthErrorMessage(): React.ReactElement {
  const { errorMessage } = useAuthScreenContext()

  return (
    <p className={AUTH_ERROR_CLASS.message} role="alert">
      {errorMessage}
    </p>
  )
}
