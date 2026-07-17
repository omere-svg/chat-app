export type ToastVariant = 'error' | 'info'

export type ToastNotification = {
  id: string
  message: string
  variant: ToastVariant
}

export type UseToastValue = {
  toastNotifications: ToastNotification[]
  showErrorToast: (message: string) => void
  dismissToast: (toastId: string) => void
}
