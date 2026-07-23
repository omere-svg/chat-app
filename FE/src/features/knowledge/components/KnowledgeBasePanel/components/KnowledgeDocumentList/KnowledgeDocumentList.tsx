import { KNOWLEDGE_DOCUMENT_LIST_CLASS } from './KnowledgeDocumentList.constants.ts'
import type { KnowledgeDocumentListProps } from './KnowledgeDocumentList.types.ts'
import './KnowledgeDocumentList.css'

export function KnowledgeDocumentList({
  children,
}: KnowledgeDocumentListProps): React.ReactElement {
  return <ul className={KNOWLEDGE_DOCUMENT_LIST_CLASS.list}>{children}</ul>
}
