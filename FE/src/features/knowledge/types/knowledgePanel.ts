import type { KnowledgeDocument } from '@/types/api.ts'

export type KnowledgePanelState = {
  documents: KnowledgeDocument[]
  isLoading: boolean
  loadError: string | null
  isUploading: boolean
  actionError: string | null
  deletingDocumentId: string | null
}

export type KnowledgePanelAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; documents: KnowledgeDocument[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_SUCCESS'; document: KnowledgeDocument }
  | { type: 'ACTION_ERROR'; error: string }
  | { type: 'DELETE_START'; documentId: string }
  | { type: 'DELETE_SUCCESS'; documentId: string }
