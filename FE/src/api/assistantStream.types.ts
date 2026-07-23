import type { ApiErrorPayload } from '../types/api.ts'
import type { Citation, Message } from '../types/domain.ts'

export type AssistantStreamHandlers = {
  onUserMessage: (message: Message) => void
  onToken: (text: string) => void
  onTool: (name: string) => void
  onToolResult: (name: string) => void
  onCitations: (citations: Citation[]) => void
  onDone: (message: Message) => void
  onError: (error: ApiErrorPayload) => void
}
