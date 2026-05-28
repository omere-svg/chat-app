import type { ApiErrorPayload } from '../types/api.ts'
import type { ConversationPreview, Message, User } from '../types/domain.ts'

export type MockDb = {
  users: User[]
  conversations: ConversationPreview[]
  messages: Map<string, Message[]>
  tokens: Map<string, string>
}

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function buildSeedMessages(
  conversationId: string,
  senderIds: string[],
  count: number,
): Message[] {
  const messages: Message[] = []
  for (let i = 0; i < count; i++) {
    messages.push({
      id: `${conversationId}-msg-${i + 1}`,
      conversationId,
      senderId: senderIds[i % senderIds.length]!,
      body: `Message ${i + 1} in ${conversationId}`,
      createdAt: isoMinutesAgo(count - i + 100),
    })
  }
  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export function createMockDb(): MockDb {
  const users: User[] = [
    { id: 'user-alice', displayName: 'Alice' },
    { id: 'user-bob', displayName: 'Bob' },
    { id: 'user-carol', displayName: 'Carol' },
  ]

  const conv1Messages = buildSeedMessages('conv-alice-bob', ['user-alice', 'user-bob'], 45)
  const conv2Messages = buildSeedMessages('conv-alice-carol', ['user-alice', 'user-carol'], 8)
  const conv3Messages = buildSeedMessages('conv-bob-carol', ['user-bob', 'user-carol'], 3)

  const last1 = conv1Messages[conv1Messages.length - 1]!
  const last2 = conv2Messages[conv2Messages.length - 1]!
  const last3 = conv3Messages[conv3Messages.length - 1]!

  const conversations: ConversationPreview[] = [
    {
      id: 'conv-alice-bob',
      title: 'Alice & Bob',
      participantIds: ['user-alice', 'user-bob'],
      lastMessage: {
        body: last1.body,
        createdAt: last1.createdAt,
        senderId: last1.senderId,
      },
      updatedAt: last1.createdAt,
    },
    {
      id: 'conv-alice-carol',
      title: 'Project sync',
      participantIds: ['user-alice', 'user-carol'],
      lastMessage: {
        body: last2.body,
        createdAt: last2.createdAt,
        senderId: last2.senderId,
      },
      updatedAt: last2.createdAt,
    },
    {
      id: 'conv-bob-carol',
      title: 'Weekend plans',
      participantIds: ['user-bob', 'user-carol'],
      lastMessage: {
        body: last3.body,
        createdAt: last3.createdAt,
        senderId: last3.senderId,
      },
      updatedAt: last3.createdAt,
    },
  ]

  const messages = new Map<string, Message[]>()
  messages.set('conv-alice-bob', conv1Messages)
  messages.set('conv-alice-carol', conv2Messages)
  messages.set('conv-bob-carol', conv3Messages)

  return {
    users,
    conversations,
    messages,
    tokens: new Map(),
  }
}

let db: MockDb = createMockDb()

export function getDb(): MockDb {
  return db
}

export function resetDb(): void {
  db = createMockDb()
}

export function issueToken(userId: string): string {
  const token = `mock-token-${userId}-${crypto.randomUUID()}`
  db.tokens.set(token, userId)
  return token
}

export function resolveUserId(token: string | null): string | null {
  if (!token) return null
  return db.tokens.get(token) ?? null
}

export function getUserConversations(userId: string): ConversationPreview[] {
  return db.conversations
    .filter((c) => c.participantIds.includes(userId))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
}

export function userInConversation(
  userId: string,
  conversationId: string,
): boolean {
  const conv = db.conversations.find((c) => c.id === conversationId)
  return conv?.participantIds.includes(userId) ?? false
}

export type PaginateMessagesResult =
  | { messages: Message[]; nextCursor: string | null }
  | { error: ApiErrorPayload }

export function paginateMessages(
  conversationId: string,
  cursor: string | null,
  limit: number,
): PaginateMessagesResult {
  const all = db.messages.get(conversationId) ?? []
  const sorted = [...all].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  if (sorted.length === 0) {
    return { messages: [], nextCursor: null }
  }

  let endIndex = sorted.length
  if (cursor) {
    const cursorIndex = sorted.findIndex((m) => m.id === cursor)
    if (cursorIndex === -1) {
      return {
        error: {
          code: 'INVALID_CURSOR',
          message: 'Pagination cursor is invalid or expired',
        },
      }
    }
    endIndex = cursorIndex
  }

  const startIndex = Math.max(0, endIndex - limit)
  const page = sorted.slice(startIndex, endIndex)
  const nextCursor = startIndex > 0 ? sorted[startIndex]!.id : null

  return { messages: page, nextCursor }
}

export function addMessage(
  conversationId: string,
  senderId: string,
  body: string,
  clientMessageId?: string,
): Message {
  const existing = db.messages.get(conversationId) ?? []
  if (clientMessageId) {
    const dup = existing.find((m) => m.id === clientMessageId)
    if (dup) return dup
  }

  const message: Message = {
    id: clientMessageId ?? `msg-${crypto.randomUUID()}`,
    conversationId,
    senderId,
    body,
    createdAt: new Date().toISOString(),
  }

  const updated = [...existing, message].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
  db.messages.set(conversationId, updated)

  const conv = db.conversations.find((c) => c.id === conversationId)
  if (conv) {
    conv.lastMessage = {
      body: message.body,
      createdAt: message.createdAt,
      senderId: message.senderId,
    }
    conv.updatedAt = message.createdAt
  }

  return message
}

