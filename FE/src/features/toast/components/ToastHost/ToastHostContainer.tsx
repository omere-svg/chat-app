import { useToast } from '@/features/toast/hooks/useToast.ts'
import { ToastItemContainer } from '../ToastItem/ToastItemContainer.tsx'
import { ToastHost } from './ToastHost.tsx'

export function ToastHostContainer(): React.ReactElement {
  const { toastNotifications } = useToast()

  const toastItems = toastNotifications.map((toast) => (
    <ToastItemContainer key={toast.id} id={toast.id} />
  ))

  return <ToastHost>{toastItems}</ToastHost>
}
