import type { Citation } from '@/types/domain.ts'

export type MessageBubbleContextValue = {
  senderName: string
  avatarUrl: string | null
  rowClassName: string
  bubbleClassName: string
  body: string
  showCursor: boolean
  isPending: boolean
  isStreaming: boolean
  createdAt: string
  tools: string[]
  completedTools: string[]
  citations: Citation[]
}
