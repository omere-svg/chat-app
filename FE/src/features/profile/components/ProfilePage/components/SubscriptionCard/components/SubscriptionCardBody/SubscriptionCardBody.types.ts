export type SubscriptionCardStatus = 'loading' | 'error' | 'active' | 'free' | 'plan'

export type SubscriptionCardBodyProps = {
  status: SubscriptionCardStatus
  planName: string | null
  priceLabel: string | null
  errorMessage: string | null
  onRetry: () => void
}
