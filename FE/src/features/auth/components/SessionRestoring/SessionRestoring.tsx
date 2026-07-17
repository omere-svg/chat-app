import '../AuthScreen/AuthScreen.css'
import {
  SESSION_RESTORING_CLASS,
  SESSION_RESTORING_TEXT,
} from './SessionRestoring.constants.ts'

export function SessionRestoring(): React.ReactElement {
  return (
    <div className={SESSION_RESTORING_CLASS.screen} role="status" aria-live="polite">
      <p className={SESSION_RESTORING_CLASS.subtitle}>
        {SESSION_RESTORING_TEXT.message}
      </p>
    </div>
  )
}
