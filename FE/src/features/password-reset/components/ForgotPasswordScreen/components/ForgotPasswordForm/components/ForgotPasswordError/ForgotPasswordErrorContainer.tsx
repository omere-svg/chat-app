import { useForgotPasswordContext } from '../../../../context/useForgotPasswordContext.tsx'
import { ForgotPasswordError } from './ForgotPasswordError.tsx'

export function ForgotPasswordErrorContainer(): React.ReactElement | null {
  const { errorMessage } = useForgotPasswordContext()

  if (errorMessage === null) {
    return null
  }

  return <ForgotPasswordError />
}
