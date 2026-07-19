import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvatarCardContainer } from './AvatarCardContainer.tsx'
import { MAX_AVATAR_BYTES } from './AvatarCard.constants.ts'
import { apiClient } from '@/api/apiClient.ts'
import type { User } from '@/types/domain.ts'

const { mockUpdateCurrentUser, authState } = vi.hoisted(() => ({
  mockUpdateCurrentUser: vi.fn(),
  authState: {
    currentUser: {
      id: 'user-1',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      avatarUrl: null,
    } as User,
  },
}))

vi.mock('@/features/auth/hooks/useAuth.ts', () => ({
  useAuth: () => ({
    currentUser: authState.currentUser,
    updateCurrentUser: mockUpdateCurrentUser,
  }),
}))

afterEach(() => {
  vi.restoreAllMocks()
  mockUpdateCurrentUser.mockReset()
  authState.currentUser = {
    id: 'user-1',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    avatarUrl: null,
  }
})

describe('AvatarCardContainer', () => {
  it('requests a URL, uploads to storage, confirms, and reports success', async () => {
    const user = userEvent.setup()
    const uploadedAvatarUrl = 'https://cdn/avatars/user-1?v=1'
    const updated: User = { ...authState.currentUser, avatarUrl: uploadedAvatarUrl }
    const ticket = {
      url: 'https://storage.local',
      fields: { key: 'avatars/user-1', 'Content-Type': 'image/png' },
      key: 'avatars/user-1',
      expiresInSeconds: 300,
    }
    const requestUrl = vi
      .spyOn(apiClient, 'requestAvatarUploadUrl')
      .mockResolvedValue(ticket)
    const upload = vi.spyOn(apiClient, 'uploadAvatarToStorage').mockResolvedValue(undefined)
    const setAvatar = vi
      .spyOn(apiClient, 'setAvatar')
      .mockResolvedValue({ avatarUrl: uploadedAvatarUrl })

    render(<AvatarCardContainer />)

    const file = new File(['image-bytes'], 'a.png', { type: 'image/png' })
    await user.upload(screen.getByLabelText('Upload new photo'), file)

    expect(await screen.findByText('Profile photo updated.')).toBeInTheDocument()
    expect(requestUrl).toHaveBeenCalledWith('image/png')
    expect(upload).toHaveBeenCalledWith(ticket, file)
    expect(setAvatar).toHaveBeenCalledWith('avatars/user-1')
    expect(mockUpdateCurrentUser).toHaveBeenCalledWith(updated)
  })

  it('rejects an unsupported file type before calling the API', async () => {
    const requestUrl = vi.spyOn(apiClient, 'requestAvatarUploadUrl')

    render(<AvatarCardContainer />)

    const file = new File(['data'], 'a.gif', { type: 'image/gif' })
    fireEvent.change(screen.getByLabelText('Upload new photo'), {
      target: { files: [file] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please choose a JPEG, PNG, or WebP image.',
    )
    expect(requestUrl).not.toHaveBeenCalled()
  })

  it('rejects a file that exceeds the size limit', async () => {
    const requestUrl = vi.spyOn(apiClient, 'requestAvatarUploadUrl')

    render(<AvatarCardContainer />)

    const file = new File(['data'], 'big.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: MAX_AVATAR_BYTES + 1 })
    fireEvent.change(screen.getByLabelText('Upload new photo'), {
      target: { files: [file] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Image must be 5 MB or smaller.',
    )
    expect(requestUrl).not.toHaveBeenCalled()
  })

  it('removes the current photo when one is set', async () => {
    const user = userEvent.setup()
    authState.currentUser = {
      ...authState.currentUser,
      avatarUrl: 'https://cdn/avatars/user-1/a.png',
    }
    const cleared: User = { ...authState.currentUser, avatarUrl: null }
    const removeAvatar = vi
      .spyOn(apiClient, 'removeAvatar')
      .mockResolvedValue({ avatarUrl: null })

    render(<AvatarCardContainer />)

    await user.click(screen.getByRole('button', { name: 'Remove photo' }))

    expect(await screen.findByText('Profile photo removed.')).toBeInTheDocument()
    expect(removeAvatar).toHaveBeenCalledTimes(1)
    expect(mockUpdateCurrentUser).toHaveBeenCalledWith(cleared)
  })

  it('disables removal when there is no photo', () => {
    render(<AvatarCardContainer />)

    expect(screen.getByRole('button', { name: 'Remove photo' })).toBeDisabled()
  })
})
