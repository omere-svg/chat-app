import type { TerminalPaymentSessionStatus } from './payment-session.js'

export interface TransitionPaymentSessionInput {
  id: string
  status: TerminalPaymentSessionStatus
  eventId: string
}
