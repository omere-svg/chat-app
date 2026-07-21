import type { ReactNode } from 'react'
import type { useRequestEmailChange } from './hooks/useRequestEmailChange.ts'

export type UseEmailChangeRequestValue = ReturnType<typeof useRequestEmailChange>

export type EmailChangeRequestProviderProps = {
  children: ReactNode
}
