export type PreviousEmailsState = {
  previousEmails: string[]
  isLoading: boolean
  hasError: boolean
}

export type PreviousEmailsAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; previousEmails: string[] }
  | { type: 'LOAD_ERROR' }
