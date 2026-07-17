import type { ToastVariant } from '@/features/toast/types/toast.ts'

export type ToastItemProps = {
  variant: ToastVariant
  message: string
  onDismiss: () => void
}
