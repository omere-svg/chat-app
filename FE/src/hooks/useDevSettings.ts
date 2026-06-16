import { useContext } from 'react'
import { DevSettingsContext } from '../context/DevSettingsContext.tsx'

type DevSettingsContextValue = {
  simulateSendFailure: boolean
  setSimulateSendFailure: (enabled: boolean) => void
}

// Production builds do not mount DevSettingsProvider, so fall back to an inert
// value rather than throwing.
const INERT_DEV_SETTINGS: DevSettingsContextValue = {
  simulateSendFailure: false,
  setSimulateSendFailure: () => undefined,
}

export function useDevSettings(): DevSettingsContextValue {
  return useContext(DevSettingsContext) ?? INERT_DEV_SETTINGS
}
