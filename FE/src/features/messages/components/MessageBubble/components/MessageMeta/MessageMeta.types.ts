import type { ReactNode } from 'react'

export type MessageMetaProps = {
  children: ReactNode
}

export type MessageMetaStatusProps = {
  label: string
  isLive: boolean
}

export type MessageMetaTimeProps = {
  label: string
  dateTime: string
}
