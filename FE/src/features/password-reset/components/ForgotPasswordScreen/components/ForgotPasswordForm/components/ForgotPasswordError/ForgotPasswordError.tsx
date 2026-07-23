import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useForgotPasswordContext } from '../../../../context/useForgotPasswordContext.tsx'

export function ForgotPasswordError(): React.ReactElement {
  const { errorMessage } = useForgotPasswordContext()

  return <ErrorBanner message={errorMessage!} />
}
