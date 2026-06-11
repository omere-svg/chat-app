import { createContext, useState, type ReactNode } from 'react'

type DevSettingsContextValue = {
  simulateSendFailure: boolean
  setSimulateSendFailure: (enabled: boolean) => void
}

export const DevSettingsContext =
  createContext<DevSettingsContextValue | null>(null)

type DevSettingsProviderProps = {
  children: ReactNode
}

export function DevSettingsProvider({
  children,
}: DevSettingsProviderProps): React.ReactElement {
  const [simulateSendFailure, setSimulateSendFailure] = useState(false)

  const contextValue: DevSettingsContextValue = {
    simulateSendFailure,
    setSimulateSendFailure,
  }

  return (
    <DevSettingsContext.Provider value={contextValue}>
      {children}
    </DevSettingsContext.Provider>
  )
}
