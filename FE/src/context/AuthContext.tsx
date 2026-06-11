import { createContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient } from '../api/apiClient.ts'
import { isRecord, parseUserResponse } from '../api/parseApiResponse.ts'
import type { User } from '../types/domain.ts'

const STORAGE_KEY = 'chat-auth'

type StoredAuth = {
  token: string
  user: User
}

type AuthContextValue = {
  currentUser: User | null
  isAuthenticated: boolean
  isRestoringSession: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || typeof parsed.token !== 'string') {
      return null
    }
    return { token: parsed.token, user: parseUserResponse(parsed.user) }
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
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(
    () => readStoredAuth()?.token != null,
  )

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

  useEffect(() => {
    const storedAuth = readStoredAuth()
    if (!storedAuth?.token) {
      setIsRestoringSession(false)
      return
    }

    let isActive = true
    apiClient
      .getCurrentUser()
      .then((verifiedUser) => {
        if (!isActive) return
        writeStoredAuth({ token: storedAuth.token, user: verifiedUser })
        setCurrentUser(verifiedUser)
      })
      .catch(() => {
        if (!isActive) return
        apiClient.setToken(null)
        writeStoredAuth(null)
        setCurrentUser(null)
      })
      .finally(() => {
        if (isActive) setIsRestoringSession(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  function persistSession(token: string, user: User): void {
    apiClient.setToken(token)
    writeStoredAuth({ token, user })
    setCurrentUser(user)
  }

  async function login(email: string, password: string): Promise<void> {
    const { token, user } = await apiClient.login({ email, password })
    persistSession(token, user)
  }

  async function signup(
    email: string,
    password: string,
    name: string,
  ): Promise<void> {
    const { token, user } = await apiClient.signup({ email, password, name })
    persistSession(token, user)
  }

  function logout(): void {
    apiClient.setToken(null)
    writeStoredAuth(null)
    setCurrentUser(null)
  }

  const contextValue: AuthContextValue = {
    currentUser,
    isAuthenticated: currentUser !== null,
    isRestoringSession,
    login,
    signup,
    logout,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
