import type { MessageRecord } from './types/message.entity.js'

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
  if (firstMessage.id < secondMessage.id) {
    return -1
  }
  if (firstMessage.id > secondMessage.id) {
    return 1
  }
  return 0
}
