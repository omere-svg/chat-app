import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import {
  EMAIL_CHANGE_CONFIRM_FAILURE_REASON,
  CONFIRM_EMAIL_TOKEN_PARAM,
  EMAIL_CHANGE_CONFIRM_TEXT,
} from '../EmailChangeConfirmScreen.constants.ts'
import {
  emailChangeConfirmReducer,
  initialEmailChangeConfirmState,
} from '../utils/emailChangeConfirmReducer.ts'

function failureReasonFor(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 'EMAIL_CHANGE_TOKEN_INVALID') {
      return EMAIL_CHANGE_CONFIRM_FAILURE_REASON.tokenInvalid
    }
    if (error.code === 'EMAIL_ALREADY_REGISTERED') {
      return EMAIL_CHANGE_CONFIRM_FAILURE_REASON.emailTaken
    }
  }
  return EMAIL_CHANGE_CONFIRM_FAILURE_REASON.retryable
}

export function useEmailChangeConfirm() {
  const [searchParams] = useSearchParams()
  const { currentUser, updateCurrentUser } = useAuth()

  const [state, dispatch] = useReducer(
    emailChangeConfirmReducer,
    initialEmailChangeConfirmState,
  )
  const processedToken = useRef<string | null | undefined>(undefined)
  const latestRequestId = useRef(0)
  const latestCurrentUser = useRef(currentUser)
  const latestUpdateCurrentUser = useRef(updateCurrentUser)

  const token = searchParams.get(CONFIRM_EMAIL_TOKEN_PARAM)

  useLayoutEffect(() => {
    latestCurrentUser.current = currentUser
    latestUpdateCurrentUser.current = updateCurrentUser
  }, [currentUser, updateCurrentUser])

  const confirm = useCallback(async (
    tokenToConfirm: string | null,
    requestId: number,
  ): Promise<void> => {
    if (tokenToConfirm === null || tokenToConfirm.length === 0) {
      dispatch({
        type: 'INVALID',
        reason: EMAIL_CHANGE_CONFIRM_FAILURE_REASON.tokenInvalid,
      })
      return
    }
    try {
      const updatedUser = await apiClient.confirmEmailChange({
        token: tokenToConfirm,
      })
      if (latestRequestId.current !== requestId) {
        return
      }
      const activeUser = latestCurrentUser.current
      if (activeUser !== null && activeUser.id === updatedUser.id) {
        latestUpdateCurrentUser.current(updatedUser)
      }
      dispatch({ type: 'SUCCESS', newEmail: updatedUser.email })
    } catch (error) {
      if (latestRequestId.current !== requestId) {
        return
      }
      dispatch({ type: 'INVALID', reason: failureReasonFor(error) })
    }
  }, [])

  useEffect(() => {
    if (processedToken.current === token) {
      return
    }
    processedToken.current = token
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId
    dispatch({ type: 'PENDING' })
    void confirm(token, requestId)
  }, [confirm, token])

  const failureMessage =
    state.status === 'invalid'
      ? EMAIL_CHANGE_CONFIRM_TEXT.failure[state.failureReason]
      : ''

  return { status: state.status, newEmail: state.newEmail, failureMessage }
}
