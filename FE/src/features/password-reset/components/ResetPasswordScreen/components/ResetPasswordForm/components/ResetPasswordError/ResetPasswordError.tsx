import { ErrorBanner } from '@/shared/components/ErrorBanner/ErrorBanner.tsx'
import { useResetPasswordContext } from '../../../../context/useResetPasswordContext.tsx'

export function ResetPasswordError(): React.ReactElement {
  const { errorMessage } = useResetPasswordContext()

  return <ErrorBanner message={errorMessage!} />
}
