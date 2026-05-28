import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { apiClient } from '../api/apiClient.ts'
import { useMessages } from './useMessages.ts'

describe('useMessages', () => {
  it('rolls back optimistic message when send fails', async () => {
    const { token } = await apiClient.login({ userId: 'user-alice' })
    apiClient.setToken(token)

    const onSendError = vi.fn()
    const { result } = renderHook(() =>
      useMessages('conv-alice-bob', 'user-alice', true, onSendError),
    )

    await waitFor(() => {
      expect(result.current.threadState.status).toBe('success')
    })

    await act(async () => {
      await result.current.sendMessage('Test failure')
    })

    await waitFor(() => {
      expect(onSendError).toHaveBeenCalled()
      expect(
        result.current.threadMessages.some(
          (message) => message.body === 'Test failure',
        ),
      ).toBe(false)
    })
  })
})
