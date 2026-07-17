import type { ReactNode } from 'react'

export type MessageToolsProps = {
  items: ReactNode
}

export type MessageToolsContainerProps = {
  tools: string[]
  completedTools: string[]
}

export type MessageToolView = {
  key: string
  label: string
  isDone: boolean
}
