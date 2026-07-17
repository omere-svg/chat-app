import { useKnowledgePanel } from '@/features/knowledge/hooks/useKnowledgePanel.ts'
import { KnowledgeDocumentListContainer } from './components/KnowledgeDocumentList/KnowledgeDocumentListContainer.tsx'
import { KnowledgeLoadError } from './components/KnowledgeLoadError/KnowledgeLoadError.tsx'
import { KnowledgePanelHeader } from './components/KnowledgePanelHeader/KnowledgePanelHeader.tsx'
import { KnowledgePanelStatus } from './components/KnowledgePanelStatus/KnowledgePanelStatus.tsx'
import { KnowledgeUpload } from './components/KnowledgeUpload/KnowledgeUpload.tsx'
import { KnowledgeBasePanel } from './KnowledgeBasePanel.tsx'

export function KnowledgeBasePanelContainer(): React.ReactElement {
  const {
    documents,
    isLoading,
    loadError,
    isUploading,
    uploadError,
    deletingDocumentId,
    uploadFile,
    deleteDocument,
    retryLoad,
  } = useKnowledgePanel()

  const isEmpty = !isLoading && !loadError && documents.length === 0

  return (
    <KnowledgeBasePanel
      header={<KnowledgePanelHeader />}
      upload={
        <KnowledgeUpload
          isUploading={isUploading}
          uploadError={uploadError}
          onUploadFile={uploadFile}
        />
      }
      status={
        <>
          {isLoading ? <KnowledgePanelStatus variant="loading" /> : null}
          {loadError ? (
            <KnowledgeLoadError message={loadError} onRetry={retryLoad} />
          ) : null}
          {isEmpty ? <KnowledgePanelStatus variant="empty" /> : null}
        </>
      }
      list={
        documents.length > 0 ? (
          <KnowledgeDocumentListContainer
            documents={documents}
            deletingDocumentId={deletingDocumentId}
            onDeleteDocument={deleteDocument}
          />
        ) : null
      }
    />
  )
}
