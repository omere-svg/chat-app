import { useState } from 'react'
import type { FormEvent } from 'react'
import { apiClient } from '@/api/apiClient.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { useProfileForm } from '@/features/profile/components/ProfilePage/hooks/useProfileForm.ts'
import { EMAIL_CARD_TEXT } from '../EmailCard.constants.ts'
import type { UseProfileEmailValue } from '../EmailCard.types.ts'

export function useProfileEmail(): UseProfileEmailValue {
  const { currentUser, updateCurrentUser } = useAuth()
  const { isSaving, status, runSave } = useProfileForm()

  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')

  const trimmedEmail = email.trim()
  const emailChanged = trimmedEmail !== (currentUser?.email ?? '')
  const canSave =
    trimmedEmail.length > 0 && currentPassword.length > 0 && emailChanged

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!canSave || isSaving) {
      return
    }
    void runSave(async () => {
      const updatedUser = await apiClient.updateEmail({
        email: trimmedEmail,
        currentPassword,
      })
      updateCurrentUser(updatedUser)
      setEmail(updatedUser.email ?? trimmedEmail)
      setCurrentPassword('')
      return EMAIL_CARD_TEXT.success
    })
  }

  return {
    email,
    currentPassword,
    setEmail,
    setCurrentPassword,
    isSaving,
    canSave,
    status,
    submitLabel: isSaving ? EMAIL_CARD_TEXT.saving : EMAIL_CARD_TEXT.save,
    handleSubmit,
  }
}
