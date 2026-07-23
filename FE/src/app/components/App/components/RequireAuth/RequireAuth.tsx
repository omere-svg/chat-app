import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { LOGIN_ROUTE } from '@/app/constants/routes.ts'
import type { RequireAuthProps } from './RequireAuth.types.ts'

export function RequireAuth({ children }: RequireAuthProps): React.ReactElement {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to={LOGIN_ROUTE} replace />
  }

  return <>{children}</>
}
