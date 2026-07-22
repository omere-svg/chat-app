import { createContext, useContext } from 'react'
import { useSubscriptionCallback } from '../hooks/useSubscriptionCallback.ts'
import type { SubscriptionCallbackProviderProps } from '../SubscriptionCallbackScreen.types.ts'
import type { UseSubscriptionCallbackValue } from './useSubscriptionCallbackContext.types.ts'

const SubscriptionCallbackContext = createContext<UseSubscriptionCallbackValue | null>(null)

export function SubscriptionCallbackProvider({
  children,
}: SubscriptionCallbackProviderProps): React.ReactElement {
  const value = useSubscriptionCallback()

  return (
    <SubscriptionCallbackContext.Provider value={value}>
      {children}
    </SubscriptionCallbackContext.Provider>
  )
}

export function useSubscriptionCallbackContext(): UseSubscriptionCallbackValue {
  const context = useContext(SubscriptionCallbackContext)
  if (context === null) {
    throw new Error(
      'useSubscriptionCallbackContext must be used within a SubscriptionCallbackProvider',
    )
  }
  return context
}
