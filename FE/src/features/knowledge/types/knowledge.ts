import type { KnowledgeDocument } from '@/types/api.ts'

export type UseKnowledgePanelValue = {
  documents: KnowledgeDocument[]
  isLoading: boolean
  loadError: string | null
  isUploading: boolean
  actionError: string | null
  deletingDocumentId: string | null
  uploadFile: (file: File) => void
  deleteDocument: (documentId: string) => void
  retryLoad: () => void
}
