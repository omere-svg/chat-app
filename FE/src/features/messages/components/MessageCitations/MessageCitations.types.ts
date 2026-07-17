import type { ReactNode } from 'react'
import type { Citation } from '@/types/domain.ts'

export type MessageCitationsProps = {
  count: number
  items: ReactNode
}

export type MessageCitationsContainerProps = {
  citations: Citation[]
}
