import { TOAST_STACK_CLASS } from './ToastStack.constants.ts'
import type { ToastStackProps } from './ToastStack.types.ts'
import './ToastStack.css'

export function ToastStack({ children }: ToastStackProps): React.ReactElement {
  return (
    <div className={TOAST_STACK_CLASS.stack} aria-live="polite">
      {children}
    </div>
  )
}
