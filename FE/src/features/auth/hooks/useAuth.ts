import { apiClient } from '@/api/apiClient.ts'
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts'
import type { User } from '@/types/domain.ts'
import {
  currentUserUpdated,
  sessionCleared,
  sessionEstablished,
} from '../store/authSlice.ts'
import { writeStoredAuth } from '../store/authStorage.ts'
import type { UseAuthValue } from '../types/auth.ts'

export function useAuth(): UseAuthValue {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.currentUser)
  const isRestoringSession = useAppSelector(
    (state) => state.auth.isRestoringSession,
  )

  function persistSession(token: string, user: User): void {
    apiClient.setToken(token)
    writeStoredAuth({ token, user })
    dispatch(sessionEstablished(user))
  }

  async function login(email: string, password: string): Promise<void> {
    const { token, user } = await apiClient.login({ email, password })
    persistSession(token, user)
  }

  async function signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    const { token, user } = await apiClient.signup({
      email,
      password,
      firstName,
      lastName,
    })
    persistSession(token, user)
  }

  function updateCurrentUser(user: User): void {
    const token = apiClient.getToken()
    if (token !== null) {
      writeStoredAuth({ token, user })
    }
    dispatch(currentUserUpdated(user))
  }

  function logout(): void {
    apiClient.setToken(null)
    writeStoredAuth(null)
    dispatch(sessionCleared())
  }

  return {
    currentUser,
    isAuthenticated: currentUser !== null,
    isRestoringSession,
    login,
    signup,
    updateCurrentUser,
    logout,
  }
}
