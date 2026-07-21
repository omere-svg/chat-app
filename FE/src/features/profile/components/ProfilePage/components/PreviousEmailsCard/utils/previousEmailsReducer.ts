import type {
  PreviousEmailsAction,
  PreviousEmailsState,
} from '../PreviousEmailsCard.types.ts'

export const initialPreviousEmailsState: PreviousEmailsState = {
  previousEmails: [],
  isLoading: true,
  hasError: false,
}

export function previousEmailsReducer(
  state: PreviousEmailsState,
  action: PreviousEmailsAction,
): PreviousEmailsState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, hasError: false }
    case 'LOAD_SUCCESS':
      return { previousEmails: action.previousEmails, isLoading: false, hasError: false }
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, hasError: true }
    default:
      return state
  }
}
