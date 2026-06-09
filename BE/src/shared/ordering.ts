import type { Message } from '../domain/types.js'

export function compareByCreatedAtAsc(a: Message, b: Message): number {
  if (a.createdAt < b.createdAt) return -1
  if (a.createdAt > b.createdAt) return 1
  return 0
}
