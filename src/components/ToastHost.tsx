import { useToast } from '../hooks/useToast.ts'
import { ToastStack } from './Toast.tsx'

export function ToastHost(): React.ReactElement {
  const { toastNotifications, dismissToast } = useToast()
  return (
    <ToastStack
      toastNotifications={toastNotifications}
      onDismissToast={dismissToast}
    />
  )
}
