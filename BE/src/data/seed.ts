import type { Conversation, Message, User } from '../domain/types.js'
import { compareByCreatedAtAsc } from '../shared/ordering.js'

const SEED_USERS: readonly User[] = [
  { id: 'user-alice', displayName: 'Alice' },
  { id: 'user-bob', displayName: 'Bob' },
  { id: 'user-carol', displayName: 'Carol' },
]

type SeedConversationSpec = {
  id: string
  title: string
  participantIds: string[]
  messageCount: number
}

const SEED_CONVERSATIONS: readonly SeedConversationSpec[] = [
  {
    id: 'conv-alice-bob',
    title: 'Alice & Bob',
    participantIds: ['user-alice', 'user-bob'],
    messageCount: 45,
  },
  {
    id: 'conv-alice-carol',
    title: 'Project sync',
    participantIds: ['user-alice', 'user-carol'],
    messageCount: 8,
  },
  {
    id: 'conv-bob-carol',
    title: 'Weekend plans',
    participantIds: ['user-bob', 'user-carol'],
    messageCount: 3,
  },
]

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function buildSeedMessages(spec: SeedConversationSpec): Message[] {
  const messages: Message[] = []

  for (let index = 0; index < spec.messageCount; index++) {
    const senderId = spec.participantIds[index % spec.participantIds.length]
    if (senderId === undefined) continue

    messages.push({
      id: `${spec.id}-msg-${index + 1}`,
      conversationId: spec.id,
      senderId,
      body: `Message ${index + 1} in ${spec.id}`,
      createdAt: isoMinutesAgo(spec.messageCount - index + 100),
    })
  }

  return messages.sort(compareByCreatedAtAsc)
}

export type SeedData = {
  users: User[]
  conversations: Conversation[]
  messagesByConversationId: Map<string, Message[]>
}

export function buildSeedData(): SeedData {
  const conversations: Conversation[] = []
  const messagesByConversationId = new Map<string, Message[]>()

  for (const spec of SEED_CONVERSATIONS) {
    const messages = buildSeedMessages(spec)
    const createdAt = messages[0]?.createdAt ?? new Date().toISOString()

    conversations.push({
      id: spec.id,
      title: spec.title,
      participantIds: spec.participantIds,
      createdAt,
    })
    messagesByConversationId.set(spec.id, messages)
  }

  return {
    users: SEED_USERS.map((user) => ({ ...user })),
    conversations,
    messagesByConversationId,
  }
}
