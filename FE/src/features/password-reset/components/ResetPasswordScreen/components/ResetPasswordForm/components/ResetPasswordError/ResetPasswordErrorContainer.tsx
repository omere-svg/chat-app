import { useResetPasswordContext } from '../../../../context/useResetPasswordContext.tsx'
import { ResetPasswordError } from './ResetPasswordError.tsx'

export function ResetPasswordErrorContainer(): React.ReactElement | null {
  const { errorMessage } = useResetPasswordContext()

  if (errorMessage === null) {
    return null
  }

  return <ResetPasswordError />
}
