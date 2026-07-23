import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ApiError, apiClient } from '@/api/apiClient.ts'

vi.mock('@/api/constants.ts', () => ({
  MESSAGE_PAGE_LIMIT: 10,
}))

import { useMessages } from './useMessages.ts'

describe('useMessages', () => {
  afterEach(() => {
    apiClient.setToken(null)
    vi.restoreAllMocks()
  })

  it('rolls back optimistic message when send fails', async () => {
    const { token } = await apiClient.login({
      email: 'alice@example.com',
      password: 'password123',
    })
    apiClient.setToken(token)

    vi.spyOn(apiClient, 'sendMessage').mockRejectedValueOnce(
      new ApiError(500, { code: 'INTERNAL_ERROR', message: 'Send failed' }),
    )

    const onSendError = vi.fn()
    const { result } = renderHook(() =>
      useMessages('conv-alice-bob', 'user-alice', onSendError),
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

  it('confirms optimistic message when send succeeds', async () => {
    const { token } = await apiClient.login({
      email: 'alice@example.com',
      password: 'password123',
    })
    apiClient.setToken(token)

    const onSendError = vi.fn()
    const onSendSuccess = vi.fn()

    const { result } = renderHook(() =>
      useMessages('conv-alice-bob', 'user-alice', onSendError, onSendSuccess),
    )

    await waitFor(() => {
      expect(result.current.threadState.status).toBe('success')
    })

    await act(async () => {
      await result.current.sendMessage('Successful message')
    })

    await waitFor(() => {
      expect(onSendSuccess).toHaveBeenCalled()
      expect(onSendError).not.toHaveBeenCalled()
      expect(
        result.current.threadMessages.some(
          (message) => message.body === 'Successful message',
        ),
      ).toBe(true)
    })
  })

  it('loads older messages when pagination is available', async () => {
    const { token } = await apiClient.login({
      email: 'alice@example.com',
      password: 'password123',
    })
    apiClient.setToken(token)

    const { result } = renderHook(() =>
      useMessages('conv-alice-bob', 'user-alice', vi.fn()),
    )

    await waitFor(() => {
      expect(result.current.threadState.status).toBe('success')
    })

    const initialMessageCount = result.current.threadMessages.length

    expect(result.current.hasMoreOlderMessages).toBe(true)

    await act(async () => {
      result.current.loadOlderMessages()
    })

    await waitFor(() => {
      expect(result.current.threadMessages.length).toBeGreaterThan(
        initialMessageCount,
      )
    })
  })
})
