import {
  KNOWLEDGE_PANEL_CLASS,
  KNOWLEDGE_PANEL_TEXT,
} from './KnowledgeBasePanel.constants.ts'
import type { KnowledgeBasePanelProps } from './KnowledgeBasePanel.types.ts'
import './KnowledgeBasePanel.css'

export function KnowledgeBasePanel({
  header,
  upload,
  status,
  list,
}: KnowledgeBasePanelProps): React.ReactElement {
  return (
    <section
      className={KNOWLEDGE_PANEL_CLASS.section}
      aria-label={KNOWLEDGE_PANEL_TEXT.ariaLabel}
    >
      {header}
      {upload}
      {status}
      {list}
    </section>
  )
}
