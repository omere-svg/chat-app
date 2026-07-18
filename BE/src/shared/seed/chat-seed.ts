import { compareMessagesByCreatedAtAscending } from '../../modules/messages/message-ordering.js'
import { toLastMessageSnapshot } from '../../modules/conversations/conversation.mapper.js'
import type { ConversationRecord } from '../../modules/conversations/types/conversation.entity.js'
import type { MessageRecord } from '../../modules/messages/types/message.entity.js'

export interface DemoUserSeed {
  id: string
  email: string
  firstName: string
  lastName: string
}

export const DEMO_USER_PASSWORD = 'password123'

export const DEMO_USERS: readonly DemoUserSeed[] = [
  { id: 'user-alice', email: 'alice@example.com', firstName: 'Alice', lastName: 'Anderson' },
  { id: 'user-bob', email: 'bob@example.com', firstName: 'Bob', lastName: 'Brown' },
  { id: 'user-carol', email: 'carol@example.com', firstName: 'Carol', lastName: 'Clark' },
]

interface SeedConversationSpec {
  id: string
  title: string
  participantIds: string[]
  messageCount: number
  lastActivityMinutesAgo: number
}

const SEED_CONVERSATION_SPECS: readonly SeedConversationSpec[] = [
  {
    id: 'conv-alice-bob',
    title: 'Alice & Bob',
    participantIds: ['user-alice', 'user-bob'],
    messageCount: 45,
    lastActivityMinutesAgo: 5,
  },
  {
    id: 'conv-alice-carol',
    title: 'Project sync',
    participantIds: ['user-alice', 'user-carol'],
    messageCount: 8,
    lastActivityMinutesAgo: 90,
  },
  {
    id: 'conv-bob-carol',
    title: 'Weekend plans',
    participantIds: ['user-bob', 'user-carol'],
    messageCount: 3,
    lastActivityMinutesAgo: 720,
  },
]

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function buildSeedMessages(spec: SeedConversationSpec): MessageRecord[] {
  const messages: MessageRecord[] = []

  for (let index = 0; index < spec.messageCount; index++) {
    const senderId = spec.participantIds[index % spec.participantIds.length]
    if (senderId === undefined) {
      continue
    }

    const minutesAgo = spec.lastActivityMinutesAgo + (spec.messageCount - 1 - index)
    messages.push({
      id: `${spec.id}-msg-${(index + 1).toString()}`,
      conversationId: spec.id,
      senderId,
      body: `Message ${(index + 1).toString()} in ${spec.id}`,
      createdAt: isoMinutesAgo(minutesAgo),
    })
  }

  return messages.sort(compareMessagesByCreatedAtAscending)
}

export interface ChatSeed {
  conversations: readonly ConversationRecord[]
  messagesByConversationId: ReadonlyMap<string, readonly MessageRecord[]>
}

function buildChatSeed(): ChatSeed {
  const conversations: ConversationRecord[] = []
  const messagesByConversationId = new Map<string, readonly MessageRecord[]>()

  for (const spec of SEED_CONVERSATION_SPECS) {
    const messages = buildSeedMessages(spec)
    const createdAt = messages[0]?.createdAt ?? new Date().toISOString()
    const newestMessage = messages.at(-1) ?? null

    conversations.push({
      id: spec.id,
      type: 'direct',
      title: spec.title,
      participantIds: [...spec.participantIds],
      lastActivityAt: newestMessage?.createdAt ?? createdAt,
      lastMessage: newestMessage === null ? null : toLastMessageSnapshot(newestMessage),
      createdAt,
    })
    messagesByConversationId.set(spec.id, messages)
  }

  return { conversations, messagesByConversationId }
}

export const CHAT_SEED: ChatSeed = buildChatSeed()
