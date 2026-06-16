import { useContext } from 'react'
import { ToastContext, type ToastNotification } from '../context/ToastContext.tsx'

type ToastContextValue = {
  toastNotifications: ToastNotification[]
  showErrorToast: (message: string) => void
  dismissToast: (toastId: string) => void
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
