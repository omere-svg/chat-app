import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types/domain.ts'
import { readStoredAuth } from './authStorage.ts'

type AuthState = {
  currentUser: User | null
  isRestoringSession: boolean
}

const storedAuth = readStoredAuth()

const initialState: AuthState = {
  currentUser: storedAuth?.user ?? null,
  isRestoringSession: storedAuth?.token != null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionEstablished(state, action: PayloadAction<User>) {
      state.currentUser = action.payload
    },
    currentUserUpdated(state, action: PayloadAction<User>) {
      state.currentUser = action.payload
    },
    sessionCleared(state) {
      state.currentUser = null
    },
    restoringSessionFinished(state) {
      state.isRestoringSession = false
    },
  },
})

export const {
  sessionEstablished,
  currentUserUpdated,
  sessionCleared,
  restoringSessionFinished,
} = authSlice.actions

export const authReducer = authSlice.reducer
