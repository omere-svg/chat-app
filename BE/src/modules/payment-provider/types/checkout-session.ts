export interface CreateCheckoutSessionInput {
  amount: number
  currency: string
  planCode: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSession {
  providerSessionId: string
  checkoutUrl: string
}
