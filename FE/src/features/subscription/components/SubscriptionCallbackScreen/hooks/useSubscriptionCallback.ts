import { useEffect, useReducer, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiClient } from '@/api/apiClient.ts'
import { SUBSCRIPTION_ACTIVE_STATUS } from '@/api/constants.ts'
import {
  SUBSCRIPTION_CALLBACK_CANCELLED_STATUS,
  SUBSCRIPTION_CALLBACK_STATUS_PARAM,
  SUBSCRIPTION_POLL_INTERVAL_MS,
  SUBSCRIPTION_POLL_MAX_ATTEMPTS,
} from '../../../constants.ts'
import {
  SUBSCRIPTION_CALLBACK_FAILURE_REASON,
  SUBSCRIPTION_CALLBACK_TEXT,
} from '../SubscriptionCallbackScreen.constants.ts'
import {
  initialSubscriptionCallbackState,
  subscriptionCallbackReducer,
} from '../utils/subscriptionCallbackReducer.ts'

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export function useSubscriptionCallback() {
  const [searchParams] = useSearchParams()
  const [state, dispatch] = useReducer(
    subscriptionCallbackReducer,
    initialSubscriptionCallbackState,
  )
  const latestRunId = useRef(0)

  const callbackStatus = searchParams.get(SUBSCRIPTION_CALLBACK_STATUS_PARAM)

  useEffect(() => {
    const runId = latestRunId.current + 1
    latestRunId.current = runId
    dispatch({ type: 'PROCESSING' })

    if (callbackStatus === SUBSCRIPTION_CALLBACK_CANCELLED_STATUS) {
      dispatch({ type: 'FAILED', reason: SUBSCRIPTION_CALLBACK_FAILURE_REASON.cancelled })
      return
    }

    async function pollForActivation(): Promise<void> {
      for (let attempt = 0; attempt < SUBSCRIPTION_POLL_MAX_ATTEMPTS; attempt += 1) {
        if (latestRunId.current !== runId) {
          return
        }
        try {
          const subscription = await apiClient.getSubscription()
          if (latestRunId.current !== runId) {
            return
          }
          if (subscription.status === SUBSCRIPTION_ACTIVE_STATUS) {
            dispatch({ type: 'SUCCESS' })
            return
          }
        } catch {
          if (latestRunId.current !== runId) {
            return
          }
        }
        await delay(SUBSCRIPTION_POLL_INTERVAL_MS)
      }
      if (latestRunId.current === runId) {
        dispatch({ type: 'FAILED', reason: SUBSCRIPTION_CALLBACK_FAILURE_REASON.timeout })
      }
    }

    void pollForActivation()
  }, [callbackStatus])

  const failureMessage =
    state.status === 'failed' ? SUBSCRIPTION_CALLBACK_TEXT.failure[state.failureReason] : ''

  return { ...state, failureMessage }
}
