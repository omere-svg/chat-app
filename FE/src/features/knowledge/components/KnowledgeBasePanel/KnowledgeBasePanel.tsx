import {
  KNOWLEDGE_PANEL_CLASS,
  KNOWLEDGE_PANEL_TEXT,
} from './KnowledgeBasePanel.constants.ts'
import { KnowledgeDocumentListContainer } from './components/KnowledgeDocumentList/KnowledgeDocumentListContainer.tsx'
import { KnowledgePanelHeader } from './components/KnowledgePanelHeader/KnowledgePanelHeader.tsx'
import { KnowledgePanelStatusContainer } from './components/KnowledgePanelStatus/KnowledgePanelStatusContainer.tsx'
import { KnowledgeUpload } from './components/KnowledgeUpload/KnowledgeUpload.tsx'
import './KnowledgeBasePanel.css'

export function KnowledgeBasePanel(): React.ReactElement {
  return (
    <section
      className={KNOWLEDGE_PANEL_CLASS.section}
      aria-label={KNOWLEDGE_PANEL_TEXT.ariaLabel}
    >
      <KnowledgePanelHeader />
      <KnowledgeUpload />
      <KnowledgePanelStatusContainer />
      <KnowledgeDocumentListContainer />
    </section>
  )
}
