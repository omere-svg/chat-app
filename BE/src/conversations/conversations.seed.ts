import { compareMessagesByCreatedAtAscending } from './message-ordering.js'
import type { ConversationRecord } from './conversation.entity.js'
import type { MessageRecord } from './message.entity.js'

interface SeedConversationSpec {
  id: string
  title: string
  participantIds: string[]
  messageCount: number
}

const SEED_CONVERSATION_SPECS: readonly SeedConversationSpec[] = [
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

function buildSeedMessages(spec: SeedConversationSpec): MessageRecord[] {
  const messages: MessageRecord[] = []

  for (let index = 0; index < spec.messageCount; index++) {
    const senderId = spec.participantIds[index % spec.participantIds.length]
    if (senderId === undefined) {
      continue
    }

    messages.push({
      id: `${spec.id}-msg-${(index + 1).toString()}`,
      conversationId: spec.id,
      senderId,
      body: `Message ${(index + 1).toString()} in ${spec.id}`,
      createdAt: isoMinutesAgo(spec.messageCount - index + 100),
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

    conversations.push({
      id: spec.id,
      title: spec.title,
      participantIds: [...spec.participantIds],
      createdAt,
    })
    messagesByConversationId.set(spec.id, messages)
  }

  return { conversations, messagesByConversationId }
}

export const CHAT_SEED: ChatSeed = buildChatSeed()
