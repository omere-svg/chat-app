import { useEffect, useRef, type RefObject } from 'react'

export function useAutoScroll<T extends HTMLElement>(
  scrollAnchorId: string,
): RefObject<T | null> {
  const scrollContainerRef = useRef<T | null>(null)
  const previousScrollAnchorIdRef = useRef(scrollAnchorId)

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const didAppendNewestMessage =
      scrollAnchorId !== previousScrollAnchorIdRef.current
    previousScrollAnchorIdRef.current = scrollAnchorId

    if (!didAppendNewestMessage) return

    scrollContainer.scrollTop = scrollContainer.scrollHeight
  }, [scrollAnchorId])

  return scrollContainerRef
}
