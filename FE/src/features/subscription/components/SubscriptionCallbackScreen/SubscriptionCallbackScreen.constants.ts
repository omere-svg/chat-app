export const SUBSCRIPTION_CALLBACK_FAILURE_REASON = {
  cancelled: 'cancelled',
  timeout: 'timeout',
  error: 'error',
} as const

export const SUBSCRIPTION_CALLBACK_TEXT = {
  heading: 'Completing your upgrade',
  processing: 'We are confirming your payment. This can take a few moments…',
  success: 'You are now on PRO. Enjoy the upgrade!',
  failure: {
    cancelled: 'The payment was cancelled. You have not been charged.',
    timeout:
      'Your payment is still being processed. Your PRO plan will activate automatically once it completes.',
    error: 'We could not confirm your payment. Please try again.',
  },
  backToProfile: 'Back to profile',
} as const

export const SUBSCRIPTION_CALLBACK_CLASS = {
  screen: 'subscription-callback-screen',
  card: 'subscription-callback-screen__card',
  heading: 'subscription-callback-screen__heading',
  message: 'subscription-callback-screen__message',
  link: 'subscription-callback-screen__link',
} as const
