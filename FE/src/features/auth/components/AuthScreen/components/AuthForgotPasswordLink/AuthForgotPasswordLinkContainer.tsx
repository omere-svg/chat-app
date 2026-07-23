import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'
import { AuthForgotPasswordLink } from './AuthForgotPasswordLink.tsx'

export function AuthForgotPasswordLinkContainer(): React.ReactElement | null {
  const { isSignup } = useAuthScreenContext()

  if (isSignup) {
    return null
  }

  return <AuthForgotPasswordLink />
}
