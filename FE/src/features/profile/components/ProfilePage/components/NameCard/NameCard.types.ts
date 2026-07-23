import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'
import type { FormStatusMessageProps } from '../FormStatusMessage/FormStatusMessage.types.ts'

export type UseProfileNameValue = {
  firstName: string
  lastName: string
  setFirstName: Dispatch<SetStateAction<string>>
  setLastName: Dispatch<SetStateAction<string>>
  isSaving: boolean
  canSave: boolean
  statusView: FormStatusMessageProps | null
  submitLabel: string
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export type ProfileNameProviderProps = {
  children: ReactNode
}
