import type { ReactNode } from 'react'
import type { ThreadMessage } from '@/types/domain.ts'

export type MessageBubbleContainerProps = {
  message: ThreadMessage
}

export type MessageBubbleProviderProps = {
  message: ThreadMessage
  children: ReactNode
}
