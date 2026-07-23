import {
  TOAST_DISMISS_LABEL,
  TOAST_DISMISS_SYMBOL,
  TOAST_ITEM_CLASS,
} from './ToastItem.constants.ts'
import { useToastItem } from './context/useToastItemContext.tsx'
import { toastItemClassName } from './ToastItem.utils.ts'
import './ToastItem.css'

export function ToastItem(): React.ReactElement {
  const { variant, message, onDismiss } = useToastItem()

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
