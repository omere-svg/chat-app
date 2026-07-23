import { createContext, useContext } from 'react'
import { useEmailChangeRequest } from '../hooks/useEmailChangeRequest.ts'
import type {
  EmailChangeRequestProviderProps,
  UseEmailChangeRequestValue,
} from '../EmailChangeRequestCard.types.ts'

const EmailChangeRequestContext = createContext<UseEmailChangeRequestValue | null>(null)

export function EmailChangeRequestProvider({
  children,
}: EmailChangeRequestProviderProps): React.ReactElement {
  const value = useEmailChangeRequest()

  return (
    <EmailChangeRequestContext.Provider value={value}>
      {children}
    </EmailChangeRequestContext.Provider>
  )
}

export function useEmailChangeRequestContext(): UseEmailChangeRequestValue {
  const context = useContext(EmailChangeRequestContext)
  if (context === null) {
    throw new Error(
      'useEmailChangeRequestContext must be used within an EmailChangeRequestProvider',
    )
  }
  return context
}
