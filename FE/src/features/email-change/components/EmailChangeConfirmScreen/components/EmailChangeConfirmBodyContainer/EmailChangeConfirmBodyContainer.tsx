import { useEmailChangeConfirmContext } from '../../context/useEmailChangeConfirmContext.tsx'
import { EMAIL_CHANGE_CONFIRM_BODY } from './EmailChangeConfirmBodyContainer.constants.ts'

export function EmailChangeConfirmBodyContainer(): React.ReactElement {
  const { status } = useEmailChangeConfirmContext()
  const Body = EMAIL_CHANGE_CONFIRM_BODY[status]

  return <Body />
}
