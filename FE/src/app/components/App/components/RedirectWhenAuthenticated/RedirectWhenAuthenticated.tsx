import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { CHAT_ROUTE } from '@/app/constants/routes.ts'
import type { RedirectWhenAuthenticatedProps } from './RedirectWhenAuthenticated.types.ts'

export function RedirectWhenAuthenticated({
  children,
}: RedirectWhenAuthenticatedProps): React.ReactElement {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to={CHAT_ROUTE} replace />
  }

  return <>{children}</>
}
