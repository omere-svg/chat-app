import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'
import { AuthErrorMessage } from './AuthErrorMessage.tsx'

export function AuthErrorMessageContainer(): React.ReactElement | null {
  const { errorMessage } = useAuthScreenContext()

  if (errorMessage === null) {
    return null
  }

  return <AuthErrorMessage />
}
