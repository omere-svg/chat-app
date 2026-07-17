import type { Dispatch, RefObject } from 'react'
import type { ThreadMessage } from '@/types/domain.ts'
import type { ThreadViewState } from '../utils/deriveThreadViewState.ts'
import type { MessagesAction, MessagesState } from '../utils/messageReducer.ts'

export type UseMessageThreadValue = {
  state: MessagesState
  dispatch: Dispatch<MessagesAction>
  activeConversationIdRef: RefObject<string | null>
  threadState: ThreadViewState
  threadMessages: ThreadMessage[]
  refetchMessages: () => void
}
