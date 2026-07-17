import {
  KNOWLEDGE_DOCUMENT_ITEM_CLASS,
  KNOWLEDGE_DOCUMENT_ITEM_TEXT,
} from './KnowledgeDocumentItem.constants.ts'
import type { KnowledgeDocumentItemProps } from './KnowledgeDocumentItem.types.ts'
import './KnowledgeDocumentItem.css'

export function KnowledgeDocumentItem({
  filename,
  meta,
  isDeleting,
  onDelete,
}: KnowledgeDocumentItemProps): React.ReactElement {
  return (
    <li className={KNOWLEDGE_DOCUMENT_ITEM_CLASS.doc}>
      <span className={KNOWLEDGE_DOCUMENT_ITEM_CLASS.name}>{filename}</span>
      <span className={KNOWLEDGE_DOCUMENT_ITEM_CLASS.meta}>{meta}</span>
      <button
        type="button"
        className={KNOWLEDGE_DOCUMENT_ITEM_CLASS.delete}
        aria-label={`${KNOWLEDGE_DOCUMENT_ITEM_TEXT.deleteAriaPrefix} ${filename}`}
        disabled={isDeleting}
        onClick={onDelete}
      >
        {isDeleting
          ? KNOWLEDGE_DOCUMENT_ITEM_TEXT.deleting
          : KNOWLEDGE_DOCUMENT_ITEM_TEXT.delete}
      </button>
    </li>
  )
}
