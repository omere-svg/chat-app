import type { PASSWORD_RESET_CONFIRM_STATUS } from '../constants.js'

export interface ConfirmPasswordResetResult {
  status: typeof PASSWORD_RESET_CONFIRM_STATUS
}
