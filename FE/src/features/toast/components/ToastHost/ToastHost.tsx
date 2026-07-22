import { ToastStack } from '../ToastStack/ToastStack.tsx'
import type { ToastHostProps } from './ToastHost.types.ts'

export function ToastHost({ children }: ToastHostProps): React.ReactElement {
  return <ToastStack>{children}</ToastStack>
}
