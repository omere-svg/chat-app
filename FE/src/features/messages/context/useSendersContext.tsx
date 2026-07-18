import { createContext, useContext, useMemo } from 'react'
import type { SendersContextValue, SendersProviderProps } from './senders.types.ts'

const SendersContext = createContext<SendersContextValue | null>(null)

export function SendersProvider({
  senders,
  children,
}: SendersProviderProps): React.ReactElement {
  const value = useMemo<SendersContextValue>(() => {
    const sendersById = new Map(senders.map((sender) => [sender.id, sender]))
    return { getSender: (senderId) => sendersById.get(senderId) }
  }, [senders])

  return <SendersContext.Provider value={value}>{children}</SendersContext.Provider>
}

export function useSenders(): SendersContextValue {
  const context = useContext(SendersContext)
  if (context === null) {
    throw new Error('useSenders must be used within a SendersProvider')
  }
  return context
}
