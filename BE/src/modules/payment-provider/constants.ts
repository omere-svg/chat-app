export const RAPYD_CHECKOUT_PATH = '/v1/checkout'

export const RAPYD_DEFAULT_COUNTRY = 'US'

export const RAPYD_SUCCESS_EVENT_TYPES: readonly string[] = ['PAYMENT_COMPLETED', 'CHECKOUT_COMPLETED']

export const RAPYD_FAILURE_EVENT_TYPES: readonly string[] = [
  'PAYMENT_FAILED',
  'PAYMENT_CANCELED',
  'PAYMENT_EXPIRED',
]

export const PAYMENT_SUCCEEDED_OUTCOME = 'succeeded'

export const PAYMENT_FAILED_OUTCOME = 'failed'
