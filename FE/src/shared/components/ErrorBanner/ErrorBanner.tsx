import {
  ERROR_BANNER_CLASS,
  ERROR_BANNER_TEXT,
} from './ErrorBanner.constants.ts'
import type { ErrorBannerProps } from './ErrorBanner.types.ts'
import './ErrorBanner.css'

export function ErrorBanner({
  message,
  onRetry,
}: ErrorBannerProps): React.ReactElement {
  return (
    <div className={ERROR_BANNER_CLASS.root} role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          className={ERROR_BANNER_CLASS.retry}
          onClick={onRetry}
        >
          {ERROR_BANNER_TEXT.retry}
        </button>
      ) : null}
    </div>
  )
}
