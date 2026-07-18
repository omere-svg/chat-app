import type { ReactNode } from 'react'
import type { ThreadMessage } from '@/types/domain.ts'

export type MessageBubbleProps = {
  rowClassName: string
  className: string
  avatar: ReactNode
  body: string
  showCursor: boolean
  tools: ReactNode
  citations: ReactNode
  meta: ReactNode
}

export type MessageBubbleContainerProps = {
  message: ThreadMessage
  isOwnMessage: boolean
  avatar: ReactNode
}
