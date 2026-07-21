import { useCallback, useEffect, useReducer } from 'react'
import { apiClient } from '@/api/apiClient.ts'
import {
  initialPreviousEmailsState,
  previousEmailsReducer,
} from '../utils/previousEmailsReducer.ts'
import type { UsePreviousEmailsValue } from '../PreviousEmailsCard.types.ts'

export function usePreviousEmails(): UsePreviousEmailsValue {
  const [state, dispatch] = useReducer(previousEmailsReducer, initialPreviousEmailsState)

  const load = useCallback(async (): Promise<void> => {
    dispatch({ type: 'LOAD_START' })
    try {
      dispatch({ type: 'LOAD_SUCCESS', previousEmails: await apiClient.getPreviousEmails() })
    } catch {
      dispatch({ type: 'LOAD_ERROR' })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    previousEmails: state.previousEmails,
    isLoading: state.isLoading,
    hasError: state.hasError,
  }
}
