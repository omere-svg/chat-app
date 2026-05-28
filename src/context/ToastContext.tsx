import { createContext, useState, type ReactNode } from 'react'

export type ToastNotification = {
  id: string
  message: string
  variant: 'error' | 'info'
}

type ToastContextValue = {
  toastNotifications: ToastNotification[]
  showErrorToast: (message: string) => void
  dismissToast: (toastId: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

type ToastProviderProps = {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps): React.ReactElement {
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>(
    [],
  )

  function dismissToast(toastId: string): void {
    setToastNotifications((previousToasts) =>
      previousToasts.filter((toast) => toast.id !== toastId),
    )
  }

  function showErrorToast(message: string): void {
    const toastId = crypto.randomUUID()
    setToastNotifications((previousToasts) => [
      ...previousToasts,
      { id: toastId, message, variant: 'error' },
    ])
    window.setTimeout(() => {
      setToastNotifications((previousToasts) =>
        previousToasts.filter((toast) => toast.id !== toastId),
      )
    }, 5000)
  }

  const contextValue: ToastContextValue = {
    toastNotifications,
    showErrorToast,
    dismissToast,
  }

  return (
    <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>
  )
}
