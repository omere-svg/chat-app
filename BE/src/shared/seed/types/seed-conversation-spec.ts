export interface SeedConversationSpec {
  id: string
  title: string
  participantIds: string[]
  messageCount: number
  lastActivityMinutesAgo: number
}
