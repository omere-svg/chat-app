import type { Conversation, Message, User } from '../domain/types.js'
import { buildSeedData } from './seed.js'

export type ChatStore = {
  users: Map<string, User>
  conversations: Map<string, Conversation>
  messagesByConversationId: Map<string, Message[]>
  userIdByToken: Map<string, string>
  messageIdByClientId: Map<string, Map<string, string>>
}

function seed(target: ChatStore): void {
  const data = buildSeedData()
  for (const user of data.users) {
    target.users.set(user.id, user)
  }
  for (const conversation of data.conversations) {
    target.conversations.set(conversation.id, conversation)
  }
  for (const [conversationId, messages] of data.messagesByConversationId) {
    target.messagesByConversationId.set(conversationId, messages)
  }
}

function createStore(): ChatStore {
  const store: ChatStore = {
    users: new Map(),
    conversations: new Map(),
    messagesByConversationId: new Map(),
    userIdByToken: new Map(),
    messageIdByClientId: new Map(),
  }
  seed(store)
  return store
}

export const store: ChatStore = createStore()

export function resetStore(): void {
  store.users.clear()
  store.conversations.clear()
  store.messagesByConversationId.clear()
  store.userIdByToken.clear()
  store.messageIdByClientId.clear()
  seed(store)
}
