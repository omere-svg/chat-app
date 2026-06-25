// Demo seed data used by the DemoDataSeeder to populate an empty database.
// Keep in sync with the FE mock seed at FE/src/mocks/db.ts (same ids, formulas,
// and message bodies) — the two are separate runtimes and cannot share a module.
import { compareMessagesByCreatedAtAscending } from '../../messages/message-ordering.js'
import { toLastMessageSnapshot } from '../../conversations/conversation.entity.js'
import type { ConversationRecord } from '../../conversations/conversation.entity.js'
import type { MessageRecord } from '../../messages/message.entity.js'

export interface DemoUserSeed {
  id: string
  email: string
  displayName: string
}

export const DEMO_USER_PASSWORD = 'password123'

export const DEMO_USERS: readonly DemoUserSeed[] = [
  { id: 'user-alice', email: 'alice@example.com', displayName: 'Alice' },
  { id: 'user-bob', email: 'bob@example.com', displayName: 'Bob' },
  { id: 'user-carol', email: 'carol@example.com', displayName: 'Carol' },
]

interface SeedConversationSpec {
  id: string
  title: string
  participantIds: string[]
  messageCount: number
  // Minutes ago for the newest message — distinct per conversation so the seeded
  // list visibly sorts by last activity, not just by the id tiebreaker.
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

    // Newest message lands at lastActivityMinutesAgo; older ones step back 1 min each.
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
