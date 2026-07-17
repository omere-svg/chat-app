import { ACCEPTED_UPLOAD_LABEL } from '@/features/knowledge/constants/knowledge.ts'
import {
  KNOWLEDGE_PANEL_HEADER_CLASS,
  KNOWLEDGE_PANEL_HEADER_TEXT,
} from './KnowledgePanelHeader.constants.ts'
import './KnowledgePanelHeader.css'

export function KnowledgePanelHeader(): React.ReactElement {
  return (
    <header className={KNOWLEDGE_PANEL_HEADER_CLASS.header}>
      <h3 className={KNOWLEDGE_PANEL_HEADER_CLASS.title}>
        {KNOWLEDGE_PANEL_HEADER_TEXT.title}
      </h3>
      <p className={KNOWLEDGE_PANEL_HEADER_CLASS.hint}>
        Upload {ACCEPTED_UPLOAD_LABEL} files. The tutor answers only from these
        documents.
      </p>
    </header>
  )
}
