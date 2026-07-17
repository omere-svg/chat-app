import type { FormStatus } from '@/features/profile/types/formStatus.ts'

export type ProfileSaveRunner = () => Promise<string>

export type UseProfileFormValue = {
  isSaving: boolean
  status: FormStatus
  runSave: (save: ProfileSaveRunner) => Promise<void>
}
