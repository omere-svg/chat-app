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
  return 0
}
