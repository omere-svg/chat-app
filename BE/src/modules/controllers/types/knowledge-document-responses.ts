import type { KnowledgeDocumentView } from '../../knowledge-document/types/knowledge-document-view.js'

export interface KnowledgeDocumentResponse {
  document: KnowledgeDocumentView
}

export interface KnowledgeDocumentListResponse {
  documents: KnowledgeDocumentView[]
}
