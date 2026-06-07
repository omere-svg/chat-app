import { ApiError } from '../../shared/ApiError.js'
import type { Message } from '../../domain/types.js'

export type MessagePage = {
  messages: Message[]
  nextCursor: string | null
}

export function paginateMessages(
  all: Message[],
  cursor: string | undefined,
  limit: number,
): MessagePage {
  if (all.length === 0) {
    return { messages: [], nextCursor: null }
  }

  let endIndex = all.length
  if (cursor !== undefined) {
    const cursorIndex = all.findIndex((message) => message.id === cursor)
    if (cursorIndex === -1) {
      throw ApiError.invalidCursor()
    }
    endIndex = cursorIndex
  }

  const startIndex = Math.max(0, endIndex - limit)
  const page = all.slice(startIndex, endIndex)
  const nextCursor = startIndex > 0 ? (all[startIndex]?.id ?? null) : null

  return { messages: page, nextCursor }
}
