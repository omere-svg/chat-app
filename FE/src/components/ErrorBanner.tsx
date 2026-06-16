type ErrorBannerProps = {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({
  message,
  onRetry,
}: ErrorBannerProps): React.ReactElement {
  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}
