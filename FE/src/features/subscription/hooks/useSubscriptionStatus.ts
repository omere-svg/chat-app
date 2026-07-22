import { useCallback, useEffect, useReducer } from 'react'
import { apiClient } from '@/api/apiClient.ts'
import { PRO_PLAN_CODE } from '@/api/constants.ts'
import {
  initialSubscriptionStatusState,
  subscriptionStatusReducer,
} from '../utils/subscriptionStatusReducer.ts'

export function useSubscriptionStatus() {
  const [state, dispatch] = useReducer(
    subscriptionStatusReducer,
    initialSubscriptionStatusState,
  )

  const load = useCallback(async (): Promise<void> => {
    dispatch({ type: 'LOAD_START' })
    try {
      const [subscriptionResult, plansResult] = await Promise.all([
        apiClient.getSubscription(),
        apiClient.listPlans(),
      ])
      dispatch({
        type: 'LOAD_SUCCESS',
        subscription: subscriptionResult,
        proPlan: plansResult.plans.find((plan) => plan.code === PRO_PLAN_CODE) ?? null,
      })
    } catch {
      dispatch({ type: 'LOAD_ERROR' })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    subscription: state.subscription,
    proPlan: state.proPlan,
    isLoading: state.isLoading,
    loadError: state.loadError,
    reload: load,
  }
}
