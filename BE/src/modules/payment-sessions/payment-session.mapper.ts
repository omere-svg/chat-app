import type { PaymentSessionDocument } from './payment-session.schema.js'
import type { PaymentSession } from './types/payment-session.js'

export function toPaymentSession(document: PaymentSessionDocument): PaymentSession {
  return {
    id: document._id,
    userId: document.userId,
    planCode: document.planCode,
    providerSessionId: document.providerSessionId,
    status: document.status,
    processedEventIds: document.processedEventIds,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}
