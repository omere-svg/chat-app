import type { FormStatus } from '@/features/profile/types/formStatus.ts'
import type { FormStatusMessageProps } from '../components/FormStatusMessage/FormStatusMessage.types.ts'

export type ProfileSaveRunner = () => Promise<string>

export type UseProfileFormValue = {
  isSaving: boolean
  status: FormStatus
  statusView: FormStatusMessageProps | null
  runSave: (save: ProfileSaveRunner) => Promise<void>
}
