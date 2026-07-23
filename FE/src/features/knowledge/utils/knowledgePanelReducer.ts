import type {
  KnowledgePanelAction,
  KnowledgePanelState,
} from '../types/knowledgePanel.ts'

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
