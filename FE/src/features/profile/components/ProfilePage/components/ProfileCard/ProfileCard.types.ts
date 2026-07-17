import type { FormEvent, ReactNode } from 'react'

export type ProfileCardProps = {
  title: string
  headingId: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
  actions: ReactNode
}
