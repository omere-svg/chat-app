export type User = {
  id: string
  email?: string
  firstName: string
  lastName: string
}

// Composes a person's full name for display. Collapses incidental whitespace so a blank
// part never produces a leading/trailing space.
export function fullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim().replace(/\s+/g, ' ')
}

// 'direct' is human-to-human; 'assistant' is an AI chat; 'tutor' is the RAG mode that
// answers from the user's uploaded knowledge base and cites its sources.
export type ConversationType = 'direct' | 'assistant' | 'tutor'

// Reserved sender id the backend uses for AI replies; never equals a real user id.
export const ASSISTANT_SENDER_ID = 'assistant'

// A source chunk a tutor answer was grounded in. Rendered under the reply so the user
// can inspect where the answer came from.
export type Citation = {
  chunkId: string
  documentId: string
  documentName: string
  text: string
  score: number
}

export type MessageMetadata = {
  replyToMessageId?: string
  // Present on tutor replies; the sources the answer cites. Survives reload because the
  // backend persists it on the message.
  citations?: Citation[]
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
  metadata?: MessageMetadata
}

export type ConversationPreview = {
  id: string
  type: ConversationType
  title: string
  participantIds: string[]
  lastMessage: Pick<Message, 'body' | 'createdAt' | 'senderId'> | null
  updatedAt: string
}

export type PendingMessage = Message & {
  clientMessageId: string
}

// The assistant reply as it streams in, before the final persisted Message arrives.
// A stream failure clears the streaming message entirely (it never carries an error
// state), so the only live status is 'streaming'.
// `annotations` carries live tool/citation UI state until the persisted Message lands.
// `tools` are announced tool runs in order; `completedTools` are those that have finished,
// so the UI can show progress ("Searching…") turning into completion.
export type StreamingMessage = Message & {
  status: 'streaming'
  annotations?: { tools?: string[]; completedTools?: string[]; citations?: Citation[] }
}

export type ThreadMessage = Message | PendingMessage | StreamingMessage
