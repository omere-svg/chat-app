import type { ReactNode } from 'react'
import type { ThreadMessage } from '@/types/domain.ts'

export type MessageListProps = {
  items: ReactNode
}

export type MessageListContainerProps = {
  messages: ThreadMessage[]
}
