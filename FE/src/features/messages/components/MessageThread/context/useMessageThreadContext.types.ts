import type { RefObject } from 'react'
import type { ThreadMessage } from '@/types/domain.ts'
import type { SenderProfile } from '@/features/messages/context/senders.types.ts'
import type { ThreadViewState } from '@/features/messages/types/threadViewState.ts'

export type UseMessageThreadScreenValue = {
  threadState: ThreadViewState
  threadMessages: ThreadMessage[]
  conversationTitle: string | null
  isTutorConversation: boolean
  senders: SenderProfile[]
  scrollContainerRef: RefObject<HTMLDivElement | null>
  hasMoreOlderMessages: boolean
  isLoadingOlderMessages: boolean
  loadOlderMessagesError: string | null
  loadOlderMessages: () => void
  refetchMessages: () => void
  messageDraft: string
  onMessageDraftChange: (value: string) => void
  handleSendMessage: () => void
  isReady: boolean
  isSendingMessage: boolean
  isComposerDisabled: boolean
  isSendDisabled: boolean
}
