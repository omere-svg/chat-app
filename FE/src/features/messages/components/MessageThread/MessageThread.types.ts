import type { ReactNode, RefObject } from 'react'

export type MessageThreadProps = {
  header: ReactNode
  knowledgePanel: ReactNode
  body: ReactNode
  composer: ReactNode
  scrollContainerRef?: RefObject<HTMLDivElement | null>
}
