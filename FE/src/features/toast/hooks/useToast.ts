import { useAppDispatch, useAppSelector } from '@/store/hooks.ts'
import { TOAST_AUTO_DISMISS_MS } from '../constants/toast.ts'
import { toastAdded, toastDismissed } from '../store/toastSlice.ts'
import type { UseToastValue } from '../types/toast.ts'

export function useToast(): UseToastValue {
  const dispatch = useAppDispatch()
  const toastNotifications = useAppSelector((state) => state.toast.notifications)

  function dismissToast(toastId: string): void {
    dispatch(toastDismissed(toastId))
  }

  function showErrorToast(message: string): void {
    const toastId = crypto.randomUUID()
    dispatch(toastAdded({ id: toastId, message, variant: 'error' }))
    window.setTimeout(() => {
      dispatch(toastDismissed(toastId))
    }, TOAST_AUTO_DISMISS_MS)
  }

  return { toastNotifications, showErrorToast, dismissToast }
}
