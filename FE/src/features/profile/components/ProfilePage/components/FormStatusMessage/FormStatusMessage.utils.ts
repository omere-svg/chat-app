import type { FormStatusValue } from '@/features/profile/types/formStatus.ts'
import {
  FORM_STATUS_CLASS,
  FORM_STATUS_ROLE,
} from './FormStatusMessage.constants.ts'
import type { FormStatusMessageProps } from './FormStatusMessage.types.ts'

export function toFormStatusView(status: FormStatusValue): FormStatusMessageProps {
  return {
    className: `${FORM_STATUS_CLASS.base} ${FORM_STATUS_CLASS.modifier[status.type]}`,
    role: FORM_STATUS_ROLE[status.type],
    message: status.message,
  }
}
