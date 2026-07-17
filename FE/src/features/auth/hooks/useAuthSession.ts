import { useEffect } from 'react'
import { apiClient } from '@/api/apiClient.ts'
import { useAppDispatch } from '@/store/hooks.ts'
import {
  restoringSessionFinished,
  sessionCleared,
  sessionEstablished,
} from '../store/authSlice.ts'
import { readStoredAuth, writeStoredAuth } from '../store/authStorage.ts'

export function useAuthSession(): void {
  const dispatch = useAppDispatch()

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      apiClient.setToken(null)
      writeStoredAuth(null)
      dispatch(sessionCleared())
    })
    return () => {
      apiClient.setUnauthorizedHandler(null)
    }
  }, [dispatch])

  useEffect(() => {
    const storedAuth = readStoredAuth()
    if (!storedAuth?.token) {
      dispatch(restoringSessionFinished())
      return
    }

    let isActive = true
    apiClient
      .getCurrentUser()
      .then((verifiedUser) => {
        if (!isActive) return
        writeStoredAuth({ token: storedAuth.token, user: verifiedUser })
        dispatch(sessionEstablished(verifiedUser))
      })
      .catch(() => {
        if (!isActive) return
        apiClient.setToken(null)
        writeStoredAuth(null)
        dispatch(sessionCleared())
      })
      .finally(() => {
        if (isActive) dispatch(restoringSessionFinished())
      })

    return () => {
      isActive = false
    }
  }, [dispatch])
}
