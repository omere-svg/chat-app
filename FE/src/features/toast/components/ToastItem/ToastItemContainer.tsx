import { useToast } from '@/features/toast/hooks/useToast.ts'
import { ToastItem } from './ToastItem.tsx'
import type { ToastItemContainerProps } from './ToastItemContainer.types.ts'

export function ToastItemContainer({ id }: ToastItemContainerProps): React.ReactElement | null {
  const { toastNotifications, dismissToast } = useToast()
  const toast = toastNotifications.find((notification) => notification.id === id)
  if (!toast) {
    return null
  }

  return (
    <ToastItem
      variant={toast.variant}
      message={toast.message}
      onDismiss={() => dismissToast(id)}
    />
  )
}
