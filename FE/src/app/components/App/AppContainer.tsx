import { SessionRestoring } from '@/features/auth/components/SessionRestoring/SessionRestoring.tsx'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { App } from './App.tsx'

export function AppContainer(): React.ReactElement {
  const { isRestoringSession } = useAuth()
  if (isRestoringSession) {
    return <SessionRestoring />
  }

  return <App />
}
