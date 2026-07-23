import { useState } from 'react'
import type { FormEvent } from 'react'
import { apiClient } from '@/api/apiClient.ts'
import { useAuth } from '@/features/auth/hooks/useAuth.ts'
import { useProfileForm } from '@/features/profile/components/ProfilePage/hooks/useProfileForm.ts'
import { NAME_CARD_TEXT } from '../NameCard.constants.ts'
import type { UseProfileNameValue } from '../NameCard.types.ts'

export function useProfileName(): UseProfileNameValue {
  const { currentUser, updateCurrentUser } = useAuth()
  const { isSaving, statusView, runSave } = useProfileForm()

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '')
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '')

  const trimmedFirstName = firstName.trim()
  const trimmedLastName = lastName.trim()
  const nameChanged =
    trimmedFirstName !== (currentUser?.firstName ?? '') ||
    trimmedLastName !== (currentUser?.lastName ?? '')
  const canSave =
    trimmedFirstName.length > 0 && trimmedLastName.length > 0 && nameChanged

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!canSave || isSaving) {
      return
    }
    void runSave(async () => {
      const updatedUser = await apiClient.updateProfile({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      })
      updateCurrentUser(updatedUser)
      setFirstName(updatedUser.firstName)
      setLastName(updatedUser.lastName)
      return NAME_CARD_TEXT.success
    })
  }

  return {
    firstName,
    lastName,
    setFirstName,
    setLastName,
    isSaving,
    canSave,
    statusView,
    submitLabel: isSaving ? NAME_CARD_TEXT.saving : NAME_CARD_TEXT.save,
    handleSubmit,
  }
}
