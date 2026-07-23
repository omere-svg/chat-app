import type { ToastNotification, ToastVariant } from '@/features/toast/types/toast.ts'

export type ToastItemContextValue = {
  variant: ToastVariant
  message: string
  onDismiss: () => void
}

export type ToastItemProviderProps = {
  toast: ToastNotification
  children: React.ReactNode
}
