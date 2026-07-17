import type { ReactNode } from 'react'
import type { KnowledgeDocument } from '@/types/api.ts'

export type KnowledgeDocumentListProps = {
  items: ReactNode
}

export type KnowledgeDocumentListContainerProps = {
  documents: KnowledgeDocument[]
  deletingDocumentId: string | null
  onDeleteDocument: (documentId: string) => void
}
