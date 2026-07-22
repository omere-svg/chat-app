import type {
  PAYMENT_SESSION_COMPLETED_STATUS,
  PAYMENT_SESSION_FAILED_STATUS,
  PAYMENT_SESSION_PENDING_STATUS,
} from '../constants.js'

export type PaymentSessionStatus =
  | typeof PAYMENT_SESSION_PENDING_STATUS
  | typeof PAYMENT_SESSION_COMPLETED_STATUS
  | typeof PAYMENT_SESSION_FAILED_STATUS

export type TerminalPaymentSessionStatus =
  | typeof PAYMENT_SESSION_COMPLETED_STATUS
  | typeof PAYMENT_SESSION_FAILED_STATUS

export interface PaymentSession {
  id: string
  userId: string
  planCode: string
  providerSessionId: string
  status: PaymentSessionStatus
  processedEventIds: string[]
  createdAt: Date
  updatedAt: Date
}
