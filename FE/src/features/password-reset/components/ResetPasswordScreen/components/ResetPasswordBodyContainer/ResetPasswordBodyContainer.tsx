import { useResetPasswordContext } from '../../context/useResetPasswordContext.tsx'
import { RESET_PASSWORD_BODY } from './ResetPasswordBodyContainer.constants.ts'

export function ResetPasswordBodyContainer(): React.ReactElement {
  const { status } = useResetPasswordContext()
  const Body = RESET_PASSWORD_BODY[status]

  return <Body />
}
