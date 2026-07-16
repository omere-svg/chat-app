import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.tsx'
import type { User } from '../types/domain.ts'

type AuthContextValue = {
  currentUser: User | null
  isAuthenticated: boolean
  isRestoringSession: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>
  updateCurrentUser: (user: User) => void
  logout: () => void
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
