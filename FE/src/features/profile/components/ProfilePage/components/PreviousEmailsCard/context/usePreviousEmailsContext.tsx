import { createContext, useContext } from 'react'
import { usePreviousEmails } from '../hooks/usePreviousEmails.ts'
import type {
  PreviousEmailsProviderProps,
  UsePreviousEmailsValue,
} from '../PreviousEmailsCard.types.ts'

const PreviousEmailsContext = createContext<UsePreviousEmailsValue | null>(null)

export function PreviousEmailsProvider({
  children,
}: PreviousEmailsProviderProps): React.ReactElement {
  const value = usePreviousEmails()

  return (
    <PreviousEmailsContext.Provider value={value}>
      {children}
    </PreviousEmailsContext.Provider>
  )
}

export function usePreviousEmailsContext(): UsePreviousEmailsValue {
  const context = useContext(PreviousEmailsContext)
  if (context === null) {
    throw new Error('usePreviousEmailsContext must be used within a PreviousEmailsProvider')
  }
  return context
}
