import type { ReactNode } from 'react'

export type MessageToolsProps = {
  items: ReactNode
}

export type MessageToolView = {
  key: string
  label: string
  isDone: boolean
}
