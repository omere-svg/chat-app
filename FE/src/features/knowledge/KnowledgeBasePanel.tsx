import { useRef } from 'react'
import { ACCEPTED_UPLOAD_EXTENSIONS } from './uploadLimits.ts'
import type { KnowledgeDocument } from '../../types/api.ts'

type KnowledgeBasePanelProps = {
  documents: KnowledgeDocument[]
  isLoading: boolean
  loadError: string | null
  isUploading: boolean
  uploadError: string | null
  deletingDocumentId: string | null
  onUploadFile: (file: File) => void
  onDeleteDocument: (documentId: string) => void
  onRetryLoad: () => void
}

function formatBytes(byteSize: number): string {
  if (byteSize < 1024) {
    return `${byteSize} B`
  }
  return `${(byteSize / 1024).toFixed(1)} KB`
}

export function KnowledgeBasePanel({
  documents,
  isLoading,
  loadError,
  isUploading,
  uploadError,
  deletingDocumentId,
  onUploadFile,
  onDeleteDocument,
  onRetryLoad,
}: KnowledgeBasePanelProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    // Reset so selecting the same file again still fires onChange.
    event.target.value = ''
    if (file !== undefined) {
      onUploadFile(file)
    }
  }

  return (
    <section className="knowledge-panel" aria-label="Knowledge base">
      <header className="knowledge-panel__header">
        <h3 className="knowledge-panel__title">Knowledge base</h3>
        <p className="knowledge-panel__hint">
          Upload {ACCEPTED_UPLOAD_EXTENSIONS.join(', ')} files. The tutor answers only
          from these documents.
        </p>
      </header>

      <div className="knowledge-panel__upload">
        <input
          ref={fileInputRef}
          id="knowledge-upload-input"
          className="knowledge-panel__file-input"
          type="file"
          accept={ACCEPTED_UPLOAD_EXTENSIONS.join(',')}
          disabled={isUploading}
          onChange={handleFileChange}
        />
        <label htmlFor="knowledge-upload-input" className="btn btn--secondary">
          {isUploading ? 'Uploading…' : 'Upload document'}
        </label>
        {uploadError ? (
          <p className="knowledge-panel__error" role="alert">
            {uploadError}
          </p>
        ) : null}
      </div>

      {isLoading ? <p className="knowledge-panel__status">Loading documents…</p> : null}

      {loadError ? (
        <div className="knowledge-panel__error" role="alert">
          {loadError}{' '}
          <button type="button" className="btn btn--link" onClick={onRetryLoad}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !loadError && documents.length === 0 ? (
        <p className="knowledge-panel__empty">No documents yet. Upload one to get started.</p>
      ) : null}

      {documents.length > 0 ? (
        <ul className="knowledge-panel__list">
          {documents.map((document) => (
            <li key={document.id} className="knowledge-panel__doc">
              <span className="knowledge-panel__doc-name">{document.filename}</span>
              <span className="knowledge-panel__doc-meta">
                {document.status === 'ready'
                  ? `${document.chunkCount} chunks · ${formatBytes(document.byteSize)}`
                  : 'Failed'}
              </span>
              <button
                type="button"
                className="btn btn--link knowledge-panel__delete"
                aria-label={`Delete ${document.filename}`}
                disabled={deletingDocumentId === document.id}
                onClick={() => onDeleteDocument(document.id)}
              >
                {deletingDocumentId === document.id ? 'Removing…' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
