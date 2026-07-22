import type { PaymentSession } from './types/payment-session.js'
import type { TransitionPaymentSessionInput } from './types/transition-payment-session-input.js'

export const PAYMENT_SESSION_REPOSITORY = Symbol('PAYMENT_SESSION_REPOSITORY')

export interface PaymentSessionRepository {
  insert(session: PaymentSession): Promise<void>
  findByProviderSessionId(providerSessionId: string): Promise<PaymentSession | null>
  transition(input: TransitionPaymentSessionInput): Promise<boolean>
}
