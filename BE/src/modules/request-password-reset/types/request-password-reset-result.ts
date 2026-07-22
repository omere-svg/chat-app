import type { PASSWORD_RESET_REQUEST_STATUS } from '../constants.js'

export interface RequestPasswordResetResult {
  status: typeof PASSWORD_RESET_REQUEST_STATUS
}
