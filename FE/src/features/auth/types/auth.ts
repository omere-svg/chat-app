import type { User } from '@/types/domain.ts'

export type StoredAuth = {
  token: string
  user: User
}

export type UseAuthValue = {
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
