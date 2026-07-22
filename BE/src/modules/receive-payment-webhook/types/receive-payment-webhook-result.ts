import type { WEBHOOK_ACCEPTED_STATUS, WEBHOOK_IGNORED_STATUS } from '../constants.js'

export interface ReceivePaymentWebhookResult {
  status: typeof WEBHOOK_ACCEPTED_STATUS | typeof WEBHOOK_IGNORED_STATUS
}
