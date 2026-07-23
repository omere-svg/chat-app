import { useState } from 'react'
import type { FormEvent } from 'react'
import { apiClient } from '@/api/apiClient.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { isValidEmail } from '@/shared/validation/isValidEmail.ts'
import { useProfileForm } from '@/features/profile/components/ProfilePage/hooks/useProfileForm.ts'
import { EMAIL_CHANGE_REQUEST_CARD_TEXT } from '../EmailChangeRequestCard.constants.ts'
import { SEND_CONFIRMATION_BUTTON_TEXT } from '../components/SendConfirmationButton/SendConfirmationButton.constants.ts'

export function useRequestEmailChange() {
  const { currentUser } = useAuth()
  const { isSaving, statusView, runSave } = useProfileForm()

  const [newEmail, setNewEmail] = useState('')

  const currentEmail = currentUser?.email ?? ''
  const trimmedNewEmail = newEmail.trim()
  const canSubmit =
    isValidEmail(trimmedNewEmail) &&
    trimmedNewEmail.toLowerCase() !== currentEmail.toLowerCase()

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!canSubmit || isSaving) {
      return
    }
    void runSave(async () => {
      await apiClient.requestEmailChange({ newEmail: trimmedNewEmail })
      setNewEmail('')
      return EMAIL_CHANGE_REQUEST_CARD_TEXT.success
    })
  }

  return {
    newEmail,
    currentEmail,
    setNewEmail,
    isSaving,
    canSubmit,
    statusView,
    submitLabel: isSaving
      ? SEND_CONFIRMATION_BUTTON_TEXT.submitting
      : SEND_CONFIRMATION_BUTTON_TEXT.submit,
    handleSubmit,
  }
}
