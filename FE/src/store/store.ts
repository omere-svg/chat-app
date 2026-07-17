import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '../features/auth/store/authSlice.ts'
import { toastReducer } from '../features/toast/store/toastSlice.ts'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
