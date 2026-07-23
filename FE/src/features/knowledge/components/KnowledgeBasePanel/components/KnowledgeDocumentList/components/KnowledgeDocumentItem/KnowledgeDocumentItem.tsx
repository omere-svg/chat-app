import { useKnowledgeContext } from '../../../../context/useKnowledgeContext.tsx'
import { documentMetaLabel } from '../../KnowledgeDocumentList.utils.ts'
import {
  KNOWLEDGE_DOCUMENT_ITEM_CLASS,
  KNOWLEDGE_DOCUMENT_ITEM_TEXT,
} from './KnowledgeDocumentItem.constants.ts'
import type { KnowledgeDocumentItemProps } from './KnowledgeDocumentItem.types.ts'
import './KnowledgeDocumentItem.css'

export function KnowledgeDocumentItem({
  document,
}: KnowledgeDocumentItemProps): React.ReactElement {
  const { deletingDocumentId, deleteDocument } = useKnowledgeContext()
  const isDeleting = deletingDocumentId === document.id
  const meta = documentMetaLabel(document)

  return (
    <li className={KNOWLEDGE_DOCUMENT_ITEM_CLASS.doc}>
      <span className={KNOWLEDGE_DOCUMENT_ITEM_CLASS.name}>{document.filename}</span>
      <span className={KNOWLEDGE_DOCUMENT_ITEM_CLASS.meta}>{meta}</span>
      <button
        type="button"
        className={KNOWLEDGE_DOCUMENT_ITEM_CLASS.delete}
        aria-label={`${KNOWLEDGE_DOCUMENT_ITEM_TEXT.deleteAriaPrefix} ${document.filename}`}
        disabled={isDeleting}
        onClick={() => deleteDocument(document.id)}
      >
        {isDeleting
          ? KNOWLEDGE_DOCUMENT_ITEM_TEXT.deleting
          : KNOWLEDGE_DOCUMENT_ITEM_TEXT.delete}
      </button>
    </li>
  )
}
