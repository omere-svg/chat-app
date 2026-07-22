import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { CHAT_ROUTE, LOGIN_ROUTE } from '@/app/constants/routes.ts'

export function DefaultRedirect(): React.ReactElement {
  const { isAuthenticated } = useAuth()

  return <Navigate to={isAuthenticated ? CHAT_ROUTE : LOGIN_ROUTE} replace />
}
