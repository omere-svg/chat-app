export interface CursorPage<TItem> {
  items: TItem[]
  nextCursor: string | null
}

export type CursorPageResult<TItem> =
  | { outcome: 'page'; page: CursorPage<TItem> }
  | { outcome: 'invalid-cursor' }

export function paginateByCursor<TItem extends { id: string }>(
  orderedItems: readonly TItem[],
  cursor: string | undefined,
  limit: number,
): CursorPageResult<TItem> {
  if (orderedItems.length === 0) {
    return { outcome: 'page', page: { items: [], nextCursor: null } }
  }

  let endIndexExclusive = orderedItems.length
  if (cursor !== undefined) {
    const cursorIndex = orderedItems.findIndex((item) => item.id === cursor)
    if (cursorIndex === -1) {
      return { outcome: 'invalid-cursor' }
    }
    endIndexExclusive = cursorIndex
  }

  const startIndex = Math.max(0, endIndexExclusive - limit)
  const items = orderedItems.slice(startIndex, endIndexExclusive)
  const nextCursor = startIndex > 0 ? (orderedItems[startIndex]?.id ?? null) : null

  return { outcome: 'page', page: { items, nextCursor } }
}
