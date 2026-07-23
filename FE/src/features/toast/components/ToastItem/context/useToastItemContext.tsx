import { createContext, useContext } from 'react'
import { useToast } from '@/features/toast/hooks/useToast.ts'
import type {
  ToastItemContextValue,
  ToastItemProviderProps,
} from './useToastItemContext.types.ts'

const ToastItemContext = createContext<ToastItemContextValue | null>(null)

export function ToastItemProvider({
  toast,
  children,
}: ToastItemProviderProps): React.ReactElement {
  const { dismissToast } = useToast()

  const value: ToastItemContextValue = {
    variant: toast.variant,
    message: toast.message,
    onDismiss: () => dismissToast(toast.id),
  }

  return <ToastItemContext.Provider value={value}>{children}</ToastItemContext.Provider>
}

export function useToastItem(): ToastItemContextValue {
  const context = useContext(ToastItemContext)
  if (context === null) {
    throw new Error('useToastItem must be used within a ToastItemProvider')
  }
  return context
}
