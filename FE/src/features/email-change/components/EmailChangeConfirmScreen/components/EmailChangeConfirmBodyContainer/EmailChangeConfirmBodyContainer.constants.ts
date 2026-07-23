import { ConfirmInvalid } from '../ConfirmInvalid/ConfirmInvalid.tsx'
import { ConfirmPending } from '../ConfirmPending/ConfirmPending.tsx'
import { ConfirmSuccess } from '../ConfirmSuccess/ConfirmSuccess.tsx'
import type { EmailChangeConfirmState } from '../../EmailChangeConfirmScreen.types.ts'

export const EMAIL_CHANGE_CONFIRM_BODY: Record<
  EmailChangeConfirmState['status'],
  React.ComponentType
> = {
  pending: ConfirmPending,
  success: ConfirmSuccess,
  invalid: ConfirmInvalid,
}
