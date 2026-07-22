import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useResetPasswordContext } from '../../../../context/useResetPasswordContext.tsx'

export function ResetPasswordError(): React.ReactElement | null {
  const { errorMessage } = useResetPasswordContext()

  if (errorMessage === null) {
    return null
  }

  return <ErrorBanner message={errorMessage} />
}
