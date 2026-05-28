import { createContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient } from '../api/apiClient.ts'
import type { User } from '../types/domain.ts'

const STORAGE_KEY = 'chat-auth'

type StoredAuth = {
  token: string
  user: User
}

type AuthContextValue = {
  currentUser: User | null
  isAuthenticated: boolean
  loginAsUser: (userId: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

function writeStoredAuth(auth: StoredAuth | null): void {
  if (auth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedAuth = readStoredAuth()
    if (storedAuth?.token) {
      apiClient.setToken(storedAuth.token)
    }
    return storedAuth?.user ?? null
  })

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      apiClient.setToken(null)
      writeStoredAuth(null)
      setCurrentUser(null)
    })
    return () => {
      apiClient.setUnauthorizedHandler(null)
    }
  }, [])

  async function loginAsUser(userId: string): Promise<void> {
    const response = await apiClient.login({ userId })
    apiClient.setToken(response.token)
    writeStoredAuth({ token: response.token, user: response.user })
    setCurrentUser(response.user)
  }

  function logout(): void {
    apiClient.setToken(null)
    writeStoredAuth(null)
    setCurrentUser(null)
  }

  const contextValue: AuthContextValue = {
    currentUser,
    isAuthenticated: currentUser !== null,
    loginAsUser,
    logout,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
