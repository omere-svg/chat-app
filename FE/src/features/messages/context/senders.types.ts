import type { ReactNode } from 'react'

export type SenderProfile = {
  id: string
  name: string
  avatarUrl: string | null
}

export type SendersContextValue = {
  getSender: (senderId: string) => SenderProfile | undefined
}

export type SendersProviderProps = {
  senders: SenderProfile[]
  children: ReactNode
}
