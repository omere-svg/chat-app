import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.tsx'
import type { User } from '../types/domain.ts'

type AuthContextValue = {
  currentUser: User | null
  isAuthenticated: boolean
  loginAsUser: (userId: string) => Promise<void>
  logout: () => void
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
