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
        {KNOWLEDGE_PANEL_HEADER_TEXT.hint}
      </p>
    </header>
  )
}
