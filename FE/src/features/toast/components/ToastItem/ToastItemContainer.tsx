import { ToastItem } from './ToastItem.tsx'
import { ToastItemProvider } from './context/useToastItemContext.tsx'
import type { ToastItemContainerProps } from './ToastItemContainer.types.ts'

export function ToastItemContainer({ toast }: ToastItemContainerProps): React.ReactElement {
  return (
    <ToastItemProvider toast={toast}>
      <ToastItem />
    </ToastItemProvider>
  )
}
