import { useToast } from '@/features/toast/hooks/useToast.ts'
import { ToastItemContainer } from '../ToastItem/ToastItemContainer.tsx'
import { ToastStack } from '../ToastStack/ToastStack.tsx'

export function ToastHostContainer(): React.ReactElement {
  const { toastNotifications } = useToast()

  const toastItems = toastNotifications.map((toast) => (
    <ToastItemContainer key={toast.id} toast={toast} />
  ))

  return <ToastStack>{toastItems}</ToastStack>
}
