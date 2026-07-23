import { useAuthScreenContext } from '../../context/useAuthScreenContext.tsx'
import { AuthNameFields } from './AuthNameFields.tsx'

export function AuthNameFieldsContainer(): React.ReactElement | null {
  const { isSignup } = useAuthScreenContext()

  if (!isSignup) {
    return null
  }

  return <AuthNameFields />
}
