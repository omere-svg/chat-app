import type { ReactNode } from 'react'
import type { useEmailChangeRequest } from './hooks/useEmailChangeRequest.ts'

export type UseEmailChangeRequestValue = ReturnType<typeof useEmailChangeRequest>

export type EmailChangeRequestProviderProps = {
  children: ReactNode
}
