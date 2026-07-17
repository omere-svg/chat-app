import {
  TOAST_DISMISS_LABEL,
  TOAST_DISMISS_SYMBOL,
  TOAST_ITEM_CLASS,
} from './ToastItem.constants.ts'
import type { ToastItemProps } from './ToastItem.types.ts'
import { toastItemClassName } from './ToastItem.utils.ts'
import './ToastItem.css'

export function ToastItem({
  variant,
  message,
  onDismiss,
}: ToastItemProps): React.ReactElement {
  return (
    <div className={toastItemClassName(variant)} role="alert">
      <span>{message}</span>
      <button
        type="button"
        className={TOAST_ITEM_CLASS.dismiss}
        aria-label={TOAST_DISMISS_LABEL}
        onClick={onDismiss}
      >
        {TOAST_DISMISS_SYMBOL}
      </button>
    </div>
  )
}
