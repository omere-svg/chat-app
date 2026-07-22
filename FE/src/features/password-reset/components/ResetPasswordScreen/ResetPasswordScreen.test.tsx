import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ResetPasswordScreenContainer } from './ResetPasswordScreenContainer.tsx'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import { FORGOT_PASSWORD_ROUTE, RESET_PASSWORD_ROUTE } from '@/app/constants/routes.ts'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderResetPassword(state?: unknown): void {
  render(
    <MemoryRouter initialEntries={[{ pathname: RESET_PASSWORD_ROUTE, state }]}>
      <Routes>
        <Route path={FORGOT_PASSWORD_ROUTE} element={<h1>Reset your password</h1>} />
        <Route path={RESET_PASSWORD_ROUTE} element={<ResetPasswordScreenContainer />} />
      </Routes>
    </MemoryRouter>,
  )
}

function fillForm(code: string, newPassword: string): void {
  fireEvent.change(screen.getByLabelText('Reset code'), { target: { value: code } })
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: newPassword } })
}

describe('ResetPasswordScreenContainer', () => {
  it('redirects to the request form when there is no email in navigation state', async () => {
    renderResetPassword(undefined)

    expect(await screen.findByText('Reset your password')).toBeInTheDocument()
  })

  it('keeps the submit disabled until a code and new password are provided', () => {
    renderResetPassword({ email: 'user@example.com' })

    const submit = screen.getByRole('button', { name: 'Reset password' })
    expect(submit).toBeDisabled()

    fillForm('123456', '')
    expect(submit).toBeDisabled()

    fillForm('123456', 'new-secret')
    expect(submit).toBeEnabled()
  })

  it('confirms the reset and shows the success message', async () => {
    const confirmSpy = vi
      .spyOn(apiClient, 'confirmPasswordReset')
      .mockResolvedValue({ status: 'password_reset' })

    renderResetPassword({ email: 'user@example.com' })

    fillForm('123456', 'new-secret')
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(await screen.findByText('Password updated')).toBeInTheDocument()
    expect(confirmSpy).toHaveBeenCalledWith({
      email: 'user@example.com',
      code: '123456',
      newPassword: 'new-secret',
    })
  })

  it('explains an invalid or expired code and stays on the form', async () => {
    vi.spyOn(apiClient, 'confirmPasswordReset').mockRejectedValue(
      new ApiError(400, {
        code: 'PASSWORD_RESET_CODE_INVALID',
        message: 'invalid',
      }),
    )

    renderResetPassword({ email: 'user@example.com' })

    fillForm('000000', 'new-secret')
    fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid or has expired/i)
    expect(screen.getByLabelText('Reset code')).toBeInTheDocument()
  })
})
