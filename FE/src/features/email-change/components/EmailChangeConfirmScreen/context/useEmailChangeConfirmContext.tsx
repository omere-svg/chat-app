import { createContext, useContext } from 'react'
import { useConfirmEmailChange } from '../hooks/useConfirmEmailChange.ts'
import type { EmailChangeConfirmProviderProps } from '../EmailChangeConfirmScreen.types.ts'
import type { UseConfirmEmailChangeValue } from './useEmailChangeConfirmContext.types.ts'

const EmailChangeConfirmContext =
  createContext<UseConfirmEmailChangeValue | null>(null)

export function EmailChangeConfirmProvider({
  children,
}: EmailChangeConfirmProviderProps): React.ReactElement {
  const value = useConfirmEmailChange()

  return (
    <EmailChangeConfirmContext.Provider value={value}>
      {children}
    </EmailChangeConfirmContext.Provider>
  )
}

export function useEmailChangeConfirmContext(): UseConfirmEmailChangeValue {
  const context = useContext(EmailChangeConfirmContext)
  if (context === null) {
    throw new Error(
      'useEmailChangeConfirmContext must be used within an EmailChangeConfirmProvider',
    )
  }
  return context
}
