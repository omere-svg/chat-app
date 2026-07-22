import type { ResetPasswordAction, ResetPasswordState } from '../ResetPasswordScreen.types.ts'

export const initialResetPasswordState: ResetPasswordState = {
  status: 'editing',
  isSubmitting: false,
  failureReason: null,
}

export function resetPasswordReducer(
  state: ResetPasswordState,
  action: ResetPasswordAction,
): ResetPasswordState {
  switch (action.type) {
    case 'SUBMIT':
      return { status: 'editing', isSubmitting: true, failureReason: null }
    case 'SUCCESS':
      return { status: 'success', isSubmitting: false, failureReason: null }
    case 'ERROR':
      return { status: 'editing', isSubmitting: false, failureReason: action.reason }
    default:
      return state
  }
}
