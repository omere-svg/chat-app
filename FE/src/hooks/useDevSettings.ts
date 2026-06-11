import { useContext } from 'react'
import { DevSettingsContext } from '../context/DevSettingsContext.tsx'

type DevSettingsContextValue = {
  simulateSendFailure: boolean
  setSimulateSendFailure: (enabled: boolean) => void
}

export function useDevSettings(): DevSettingsContextValue {
  const context = useContext(DevSettingsContext)
  if (!context) {
    throw new Error('useDevSettings must be used within DevSettingsProvider')
  }
  return context
}
