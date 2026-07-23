import {
  toConversationParticipantView,
  toConversationPreview,
} from './conversation.mapper.js'
import type { ConversationRecord } from './types/conversation.entity.js'
import type { ConversationPreview } from './types/conversation-preview.js'
import type { User } from '../users/types/user.js'

export function resolveConversationParticipants(
  conversation: ConversationRecord,
  usersById: Map<string, User>,
): User[] {
  return conversation.participantIds
    .map((participantId) => usersById.get(participantId))
    .filter((participant): participant is User => participant !== undefined)
}

export function buildConversationPreview(
  conversation: ConversationRecord,
  participants: readonly User[],
): ConversationPreview {
  return toConversationPreview(conversation, participants.map(toConversationParticipantView))
}
