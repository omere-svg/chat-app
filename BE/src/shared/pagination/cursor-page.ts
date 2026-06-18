export interface CursorPage<TItem> {
  items: TItem[]
  nextCursor: string | null
}

export type CursorPageResult<TItem> =
  | { outcome: 'page'; page: CursorPage<TItem> }
  | { outcome: 'invalid-cursor' }
