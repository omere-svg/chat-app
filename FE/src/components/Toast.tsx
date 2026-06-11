import type { ToastNotification } from '../context/ToastContext.tsx'

type ToastStackProps = {
  toastNotifications: ToastNotification[]
  onDismissToast: (toastId: string) => void
}

export function ToastStack({
  toastNotifications,
  onDismissToast,
}: ToastStackProps): React.ReactElement {
  return (
    <div className="toast-stack" aria-live="polite">
      {toastNotifications.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.variant}`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast__dismiss"
            aria-label="Dismiss"
            onClick={() => onDismissToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
