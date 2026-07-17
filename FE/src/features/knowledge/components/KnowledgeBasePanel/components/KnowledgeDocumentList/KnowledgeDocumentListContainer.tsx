import { KnowledgeDocumentItem } from './components/KnowledgeDocumentItem/KnowledgeDocumentItem.tsx'
import { KnowledgeDocumentList } from './KnowledgeDocumentList.tsx'
import type { KnowledgeDocumentListContainerProps } from './KnowledgeDocumentList.types.ts'
import { documentMetaLabel } from './KnowledgeDocumentList.utils.ts'

export function KnowledgeDocumentListContainer({
  documents,
  deletingDocumentId,
  onDeleteDocument,
}: KnowledgeDocumentListContainerProps): React.ReactElement {
  const items = documents.map((document) => (
    <KnowledgeDocumentItem
      key={document.id}
      filename={document.filename}
      meta={documentMetaLabel(document)}
      isDeleting={deletingDocumentId === document.id}
      onDelete={() => onDeleteDocument(document.id)}
    />
  ))

  return <KnowledgeDocumentList items={items} />
}
