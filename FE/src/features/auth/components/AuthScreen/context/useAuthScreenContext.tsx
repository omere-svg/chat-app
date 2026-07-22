import { createContext, useContext } from 'react'
import { useAuthScreen } from '../hooks/useAuthScreen.ts'
import type {
  AuthScreenProviderProps,
  UseAuthScreenValue,
} from '../AuthScreen.types.ts'

const AuthScreenContext = createContext<UseAuthScreenValue | null>(null)

export function AuthScreenProvider({
  children,
}: AuthScreenProviderProps): React.ReactElement {
  const value = useAuthScreen()

  return (
    <AuthScreenContext.Provider value={value}>{children}</AuthScreenContext.Provider>
  )
}

export function useAuthScreenContext(): UseAuthScreenValue {
  const context = useContext(AuthScreenContext)
  if (context === null) {
    throw new Error('useAuthScreenContext must be used within an AuthScreenProvider')
  }
  return context
}
