import { useAuthSession } from '@/features/auth/hooks/useAuthSession.ts'
import type { AuthProviderProps } from './AuthProvider.types.ts'

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  useAuthSession()
  return <>{children}</>
}
