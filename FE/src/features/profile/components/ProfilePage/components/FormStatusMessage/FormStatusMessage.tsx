import type { FormStatusMessageProps } from './FormStatusMessage.types.ts'
import './FormStatusMessage.css'

export function FormStatusMessage({
  className,
  role,
  message,
}: FormStatusMessageProps): React.ReactElement {
  return (
    <p className={className} role={role}>
      {message}
    </p>
  )
}
