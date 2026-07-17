import type { ReactNode } from 'react'
import type { ThreadMessage } from '@/types/domain.ts'

export type MessageBubbleProps = {
  className: string
  body: string
  showCursor: boolean
  tools: ReactNode
  citations: ReactNode
  meta: ReactNode
}

export type MessageBubbleContainerProps = {
  message: ThreadMessage
  isOwnMessage: boolean
}
