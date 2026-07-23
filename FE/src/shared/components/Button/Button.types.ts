import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export type ButtonType = 'button' | 'submit'

export type ButtonProps = {
  children: ReactNode
  type?: ButtonType
  variant?: ButtonVariant
  disabled?: boolean
  onClick?: () => void
}
