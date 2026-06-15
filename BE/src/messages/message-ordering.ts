import type { MessageRecord } from './message.entity.js'

export function compareMessagesByCreatedAtAscending(
  firstMessage: MessageRecord,
  secondMessage: MessageRecord,
): number {
  if (firstMessage.createdAt < secondMessage.createdAt) {
    return -1
  }
  if (firstMessage.createdAt > secondMessage.createdAt) {
    return 1
  }
  // Stable tiebreaker so messages created in the same millisecond keep a
  // deterministic order across re-sorts (the FE mirrors this rule).
  if (firstMessage.id < secondMessage.id) {
    return -1
  }
  if (firstMessage.id > secondMessage.id) {
    return 1
  }
  return 0
}
