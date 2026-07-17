import type { ReactNode, RefObject } from 'react'
import type { ConversationPreview } from '@/types/domain.ts'

export type MessageThreadProps = {
  header: ReactNode
  knowledgePanel: ReactNode
  body: ReactNode
  composer: ReactNode
  scrollContainerRef?: RefObject<HTMLDivElement | null>
}

export type MessageThreadContainerProps = {
  selectedConversationId: string | null
  conversations: ConversationPreview[]
  onMessageSendSuccess: () => void
}
