import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ForgotPasswordScreenContainer } from './ForgotPasswordScreenContainer.tsx'
import { ResetPasswordScreenContainer } from '../ResetPasswordScreen/ResetPasswordScreenContainer.tsx'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import { FORGOT_PASSWORD_ROUTE, RESET_PASSWORD_ROUTE } from '@/app/constants/routes.ts'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderForgotPassword(): void {
  render(
    <MemoryRouter initialEntries={[FORGOT_PASSWORD_ROUTE]}>
      <Routes>
        <Route path={FORGOT_PASSWORD_ROUTE} element={<ForgotPasswordScreenContainer />} />
        <Route path={RESET_PASSWORD_ROUTE} element={<ResetPasswordScreenContainer />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ForgotPasswordScreenContainer', () => {
  it('keeps the submit disabled until a valid email is entered', () => {
    renderForgotPassword()

    expect(screen.getByRole('button', { name: 'Send reset code' })).toBeDisabled()
  })

  it('sends a reset code and advances to the reset screen', async () => {
    const requestSpy = vi
      .spyOn(apiClient, 'requestPasswordReset')
      .mockResolvedValue({ status: 'reset_code_sent' })

    renderForgotPassword()

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))

    expect(await screen.findByText('Enter your reset code')).toBeInTheDocument()
    expect(requestSpy).toHaveBeenCalledWith({ email: 'user@example.com' })
  })

  it('surfaces a server error without leaving the request form', async () => {
    vi.spyOn(apiClient, 'requestPasswordReset').mockRejectedValue(
      new ApiError(500, { code: 'INTERNAL_ERROR', message: 'Server error' }),
    )

    renderForgotPassword()

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error')
    expect(screen.getByText('Reset your password')).toBeInTheDocument()
  })
})
