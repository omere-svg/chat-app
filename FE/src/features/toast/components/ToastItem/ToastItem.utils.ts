import type { ToastVariant } from '@/features/toast/types/toast.ts'
import { TOAST_ITEM_CLASS } from './ToastItem.constants.ts'

export function toastItemClassName(variant: ToastVariant): string {
  return `${TOAST_ITEM_CLASS.base} ${TOAST_ITEM_CLASS.variant[variant]}`
}
