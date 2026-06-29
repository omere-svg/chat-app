import type { KnowledgeDocument } from '../../types/api.ts'

// State for the knowledge-base panel. A reducer (not useState) because the load /
// upload / delete flows share fields with interdependent transitions, and dispatch —
// unlike a useState setter — is safe to call from the load effect.
export type KnowledgePanelState = {
  documents: KnowledgeDocument[]
  isLoading: boolean
  loadError: string | null
  isUploading: boolean
  // Surfaces both client-side validation failures and failed upload/delete requests.
  actionError: string | null
  deletingDocumentId: string | null
}

export const initialKnowledgePanelState: KnowledgePanelState = {
  documents: [],
  isLoading: true,
  loadError: null,
  isUploading: false,
  actionError: null,
  deletingDocumentId: null,
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

export function knowledgePanelReducer(
  state: KnowledgePanelState,
  action: KnowledgePanelAction,
): KnowledgePanelState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, loadError: null }
    case 'LOAD_SUCCESS':
      return { ...state, isLoading: false, loadError: null, documents: action.documents }
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, loadError: action.error }
    case 'UPLOAD_START':
      return { ...state, isUploading: true, actionError: null }
    case 'UPLOAD_SUCCESS':
      // Re-upload of identical content returns the existing document; replace by id so
      // it is never duplicated, newest first.
      return {
        ...state,
        isUploading: false,
        documents: [
          action.document,
          ...state.documents.filter((existing) => existing.id !== action.document.id),
        ],
      }
    case 'ACTION_ERROR':
      return { ...state, isUploading: false, deletingDocumentId: null, actionError: action.error }
    case 'DELETE_START':
      return { ...state, deletingDocumentId: action.documentId, actionError: null }
    case 'DELETE_SUCCESS':
      return {
        ...state,
        deletingDocumentId: null,
        documents: state.documents.filter((existing) => existing.id !== action.documentId),
      }
  }
}
