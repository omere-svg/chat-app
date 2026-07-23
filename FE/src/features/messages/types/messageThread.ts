import type { Dispatch, RefObject } from 'react'
import type { ThreadMessage } from '@/types/domain.ts'
import type { ThreadViewState } from './threadViewState.ts'
import type { MessagesAction, MessagesState } from './messagesState.ts'

export type UseMessageThreadValue = {
  state: MessagesState
  dispatch: Dispatch<MessagesAction>
  activeConversationIdRef: RefObject<string | null>
  threadState: ThreadViewState
  threadMessages: ThreadMessage[]
  refetchMessages: () => void
}

export type UseMessagesValue = {
  threadState: ThreadViewState
  threadMessages: ThreadMessage[]
  hasMoreOlderMessages: boolean
  isLoadingOlderMessages: boolean
  loadOlderMessagesError: string | null
  loadOlderMessages: () => void
  sendMessage: (messageContent: string) => Promise<boolean>
  isSendingMessage: boolean
  refetchMessages: () => void
}

export type UseOlderMessagesValue = {
  loadOlderMessages: () => void
  hasMoreOlderMessages: boolean
  isLoadingOlderMessages: boolean
  loadOlderMessagesError: string | null
}

export type UseSendMessageValue = {
  sendMessage: (messageContent: string) => Promise<boolean>
  isSendingMessage: boolean
}

export type UseAssistantStreamValue = {
  sendMessage: (messageContent: string) => Promise<boolean>
  isStreaming: boolean
}
