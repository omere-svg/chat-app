import { createContext, useContext } from 'react'
import { useEmailChangeConfirm } from '../hooks/useEmailChangeConfirm.ts'
import type { EmailChangeConfirmProviderProps } from '../EmailChangeConfirmScreen.types.ts'
import type { UseEmailChangeConfirmValue } from './useEmailChangeConfirmContext.types.ts'

const EmailChangeConfirmContext =
  createContext<UseEmailChangeConfirmValue | null>(null)

export function EmailChangeConfirmProvider({
  children,
}: EmailChangeConfirmProviderProps): React.ReactElement {
  const value = useEmailChangeConfirm()

  return (
    <EmailChangeConfirmContext.Provider value={value}>
      {children}
    </EmailChangeConfirmContext.Provider>
  )
}

export function useEmailChangeConfirmContext(): UseEmailChangeConfirmValue {
  const context = useContext(EmailChangeConfirmContext)
  if (context === null) {
    throw new Error(
      'useEmailChangeConfirmContext must be used within an EmailChangeConfirmProvider',
    )
  }
  return context
}
