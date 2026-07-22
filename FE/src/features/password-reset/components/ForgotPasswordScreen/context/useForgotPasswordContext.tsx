import { createContext, useContext } from 'react'
import { useRequestPasswordReset } from '../hooks/useRequestPasswordReset.ts'
import type { ForgotPasswordProviderProps } from '../ForgotPasswordScreen.types.ts'
import type { UseForgotPasswordValue } from './useForgotPasswordContext.types.ts'

const ForgotPasswordContext = createContext<UseForgotPasswordValue | null>(null)

export function ForgotPasswordProvider({
  children,
}: ForgotPasswordProviderProps): React.ReactElement {
  const value = useRequestPasswordReset()

  return (
    <ForgotPasswordContext.Provider value={value}>{children}</ForgotPasswordContext.Provider>
  )
}

export function useForgotPasswordContext(): UseForgotPasswordValue {
  const context = useContext(ForgotPasswordContext)
  if (context === null) {
    throw new Error('useForgotPasswordContext must be used within a ForgotPasswordProvider')
  }
  return context
}
