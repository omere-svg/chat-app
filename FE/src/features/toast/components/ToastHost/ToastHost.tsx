import { useToast } from '@/features/toast/hooks/useToast.ts'
import { ToastItem } from '../ToastItem/ToastItem.tsx'
import { ToastStack } from '../ToastStack/ToastStack.tsx'

export function ToastHost(): React.ReactElement {
  const { toastNotifications, dismissToast } = useToast()

  const toastItems = toastNotifications.map((toast) => (
    <ToastItem
      key={toast.id}
      variant={toast.variant}
      message={toast.message}
      onDismiss={() => dismissToast(toast.id)}
    />
  ))

  return <ToastStack>{toastItems}</ToastStack>
}
