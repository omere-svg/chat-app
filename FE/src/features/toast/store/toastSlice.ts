import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ToastNotification } from '../types/toast.ts'

type ToastState = {
  notifications: ToastNotification[]
}

const initialState: ToastState = {
  notifications: [],
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    toastAdded(state, action: PayloadAction<ToastNotification>) {
      state.notifications.push(action.payload)
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (toast) => toast.id !== action.payload,
      )
    },
  },
})

export const { toastAdded, toastDismissed } = toastSlice.actions

export const toastReducer = toastSlice.reducer
