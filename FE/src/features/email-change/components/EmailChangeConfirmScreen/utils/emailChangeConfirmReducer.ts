import type {
  EmailChangeConfirmAction,
  EmailChangeConfirmState,
} from '../EmailChangeConfirmScreen.types.ts'

export const initialEmailChangeConfirmState: EmailChangeConfirmState = {
  status: 'pending',
  newEmail: '',
  failureReason: null,
}

export function emailChangeConfirmReducer(
  state: EmailChangeConfirmState,
  action: EmailChangeConfirmAction,
): EmailChangeConfirmState {
  switch (action.type) {
    case 'PENDING':
      return initialEmailChangeConfirmState
    case 'SUCCESS':
      return {
        status: 'success',
        newEmail: action.newEmail,
        failureReason: null,
      }
    case 'INVALID':
      return {
        status: 'invalid',
        newEmail: '',
        failureReason: action.reason,
      }
    default:
      return state
  }
}
