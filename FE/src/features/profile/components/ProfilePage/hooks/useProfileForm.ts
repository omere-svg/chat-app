import { useState } from 'react'
import type { FormStatus } from '@/features/profile/types/formStatus.ts'
import { errorMessageFrom } from '@/features/profile/utils/errorMessage.ts'
import type { ProfileSaveRunner, UseProfileFormValue } from '../types/profileForm.ts'

export function useProfileForm(): UseProfileFormValue {
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<FormStatus>(null)

  async function runSave(save: ProfileSaveRunner): Promise<void> {
    setIsSaving(true)
    setStatus(null)
    try {
      const successMessage = await save()
      setStatus({ type: 'success', message: successMessage })
    } catch (error) {
      setStatus({ type: 'error', message: errorMessageFrom(error) })
    } finally {
      setIsSaving(false)
    }
  }

  return { isSaving, status, runSave }
}
