import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useForgotPasswordContext } from '../../../../context/useForgotPasswordContext.tsx'

export function ForgotPasswordError(): React.ReactElement | null {
  const { errorMessage } = useForgotPasswordContext()

  if (errorMessage === null) {
    return null
  }

  return <ErrorBanner message={errorMessage} />
}
