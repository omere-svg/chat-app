import { useCallback, useEffect, useReducer } from 'react'
import { apiClient, ApiError } from '../../api/apiClient.ts'
import { KnowledgeBasePanel } from './KnowledgeBasePanel.tsx'
import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  hasAcceptedExtension,
} from './uploadLimits.ts'
import {
  initialKnowledgePanelState,
  knowledgePanelReducer,
} from './knowledgePanelReducer.ts'

// Owns the user's knowledge-base state for the tutor view: load, upload (with the same
// extension/size limits the backend enforces, checked client-side first), and delete.
// A failed upload or delete preserves the current list and surfaces the error.
export function KnowledgeBasePanelContainer(): React.ReactElement {
  const [state, dispatch] = useReducer(knowledgePanelReducer, initialKnowledgePanelState)

  const loadDocuments = useCallback(async (): Promise<void> => {
    dispatch({ type: 'LOAD_START' })
    try {
      const response = await apiClient.listKnowledgeDocuments()
      dispatch({ type: 'LOAD_SUCCESS', documents: response.documents })
    } catch (error) {
      dispatch({
        type: 'LOAD_ERROR',
        error: error instanceof ApiError ? error.message : 'Could not load your documents.',
      })
    }
  }, [])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  async function handleUploadFile(file: File): Promise<void> {
    if (!hasAcceptedExtension(file.name)) {
      dispatch({
        type: 'ACTION_ERROR',
        error: `Only ${ACCEPTED_UPLOAD_EXTENSIONS.join(', ')} files are supported.`,
      })
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      dispatch({
        type: 'ACTION_ERROR',
        error: `File is too large (max ${Math.round(MAX_UPLOAD_BYTES / 1000)} KB).`,
      })
      return
    }

    dispatch({ type: 'UPLOAD_START' })
    try {
      const { document } = await apiClient.uploadKnowledgeDocument(file)
      dispatch({ type: 'UPLOAD_SUCCESS', document })
    } catch (error) {
      dispatch({
        type: 'ACTION_ERROR',
        error: error instanceof ApiError ? error.message : 'Upload failed. Please try again.',
      })
    }
  }

  async function handleDeleteDocument(documentId: string): Promise<void> {
    dispatch({ type: 'DELETE_START', documentId })
    try {
      await apiClient.deleteKnowledgeDocument(documentId)
      dispatch({ type: 'DELETE_SUCCESS', documentId })
    } catch (error) {
      dispatch({
        type: 'ACTION_ERROR',
        error: error instanceof ApiError ? error.message : 'Could not delete the document.',
      })
    }
  }

  return (
    <KnowledgeBasePanel
      documents={state.documents}
      isLoading={state.isLoading}
      loadError={state.loadError}
      isUploading={state.isUploading}
      uploadError={state.actionError}
      deletingDocumentId={state.deletingDocumentId}
      onUploadFile={(file) => void handleUploadFile(file)}
      onDeleteDocument={(documentId) => void handleDeleteDocument(documentId)}
      onRetryLoad={() => void loadDocuments()}
    />
  )
}
