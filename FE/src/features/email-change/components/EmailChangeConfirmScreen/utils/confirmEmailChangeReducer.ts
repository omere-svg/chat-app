import type {
  ConfirmEmailChangeAction,
  ConfirmEmailChangeState,
} from '../EmailChangeConfirmScreen.types.ts'

export const initialConfirmEmailChangeState: ConfirmEmailChangeState = {
  status: 'pending',
  newEmail: '',
  failureReason: null,
}

export function confirmEmailChangeReducer(
  state: ConfirmEmailChangeState,
  action: ConfirmEmailChangeAction,
): ConfirmEmailChangeState {
  switch (action.type) {
    case 'PENDING':
      return initialConfirmEmailChangeState
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
