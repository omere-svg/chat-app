import { AuthScreen } from './AuthScreen.tsx'
import { AuthScreenProvider } from './context/useAuthScreenContext.tsx'

export function AuthScreenContainer(): React.ReactElement {
  return (
    <AuthScreenProvider>
      <AuthScreen />
    </AuthScreenProvider>
  )
}
