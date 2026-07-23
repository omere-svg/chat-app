import { useCallback, useEffect, useReducer } from 'react'
import { apiClient, ApiError } from '@/api/apiClient.ts'
import {
  KNOWLEDGE_ERROR,
  KNOWLEDGE_MESSAGE,
  MAX_UPLOAD_BYTES,
  initialKnowledgePanelState,
} from '../constants/knowledge.ts'
import type { UseKnowledgePanelValue } from '../types/knowledge.ts'
import { knowledgePanelReducer } from '../utils/knowledgePanelReducer.ts'
import { hasAcceptedExtension } from '../utils/uploadLimits.ts'

export function useKnowledgePanel(): UseKnowledgePanelValue {
  const [state, dispatch] = useReducer(
    knowledgePanelReducer,
    initialKnowledgePanelState,
  )

  const loadDocuments = useCallback(async (): Promise<void> => {
    dispatch({ type: 'LOAD_START' })
    try {
      const response = await apiClient.listKnowledgeDocuments()
      dispatch({ type: 'LOAD_SUCCESS', documents: response.documents })
    } catch (error) {
      dispatch({
        type: 'LOAD_ERROR',
        error: error instanceof ApiError ? error.message : KNOWLEDGE_ERROR.load,
      })
    }
  }, [])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  async function uploadFile(file: File): Promise<void> {
    if (!hasAcceptedExtension(file.name)) {
      dispatch({
        type: 'ACTION_ERROR',
        error: KNOWLEDGE_MESSAGE.unsupportedExtension,
      })
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      dispatch({ type: 'ACTION_ERROR', error: KNOWLEDGE_MESSAGE.fileTooLarge })
      return
    }

    dispatch({ type: 'UPLOAD_START' })
    try {
      const { document } = await apiClient.uploadKnowledgeDocument(file)
      dispatch({ type: 'UPLOAD_SUCCESS', document })
    } catch (error) {
      dispatch({
        type: 'ACTION_ERROR',
        error: error instanceof ApiError ? error.message : KNOWLEDGE_ERROR.upload,
      })
    }
  }

  async function deleteDocument(documentId: string): Promise<void> {
    dispatch({ type: 'DELETE_START', documentId })
    try {
      await apiClient.deleteKnowledgeDocument(documentId)
      dispatch({ type: 'DELETE_SUCCESS', documentId })
    } catch (error) {
      dispatch({
        type: 'ACTION_ERROR',
        error: error instanceof ApiError ? error.message : KNOWLEDGE_ERROR.delete,
      })
    }
  }

  return {
    documents: state.documents,
    isLoading: state.isLoading,
    loadError: state.loadError,
    isUploading: state.isUploading,
    actionError: state.actionError,
    deletingDocumentId: state.deletingDocumentId,
    uploadFile: (file) => void uploadFile(file),
    deleteDocument: (documentId) => void deleteDocument(documentId),
    retryLoad: () => void loadDocuments(),
  }
}
