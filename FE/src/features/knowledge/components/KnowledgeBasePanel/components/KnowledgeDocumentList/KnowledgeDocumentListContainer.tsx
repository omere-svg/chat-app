import { useKnowledgeContext } from '../../context/useKnowledgeContext.tsx'
import { KnowledgeDocumentItem } from './components/KnowledgeDocumentItem/KnowledgeDocumentItem.tsx'
import { KnowledgeDocumentList } from './KnowledgeDocumentList.tsx'
import { documentMetaLabel } from './KnowledgeDocumentList.utils.ts'

export function KnowledgeDocumentListContainer(): React.ReactElement | null {
  const { documents, deletingDocumentId, deleteDocument } = useKnowledgeContext()

  if (documents.length === 0) {
    return null
  }

  const items = documents.map((document) => (
    <KnowledgeDocumentItem
      key={document.id}
      filename={document.filename}
      meta={documentMetaLabel(document)}
      isDeleting={deletingDocumentId === document.id}
      onDelete={() => deleteDocument(document.id)}
    />
  ))

  return <KnowledgeDocumentList items={items} />
}
