export type FormStatusType = 'success' | 'error'

export type FormStatusValue = {
  type: FormStatusType
  message: string
}

export type FormStatus = FormStatusValue | null
