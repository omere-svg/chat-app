import { createContext, useContext } from 'react'
import { useResetPassword } from '../hooks/useResetPassword.ts'
import type { ResetPasswordProviderProps } from '../ResetPasswordScreen.types.ts'
import type { UseResetPasswordValue } from './useResetPasswordContext.types.ts'

const ResetPasswordContext = createContext<UseResetPasswordValue | null>(null)

export function ResetPasswordProvider({
  children,
}: ResetPasswordProviderProps): React.ReactElement {
  const value = useResetPassword()

  return (
    <ResetPasswordContext.Provider value={value}>{children}</ResetPasswordContext.Provider>
  )
}

export function useResetPasswordContext(): UseResetPasswordValue {
  const context = useContext(ResetPasswordContext)
  if (context === null) {
    throw new Error('useResetPasswordContext must be used within a ResetPasswordProvider')
  }
  return context
}
