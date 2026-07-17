import {
  KNOWLEDGE_PANEL_STATUS_CLASS,
  KNOWLEDGE_PANEL_STATUS_TEXT,
} from './KnowledgePanelStatus.constants.ts'
import type { KnowledgePanelStatusProps } from './KnowledgePanelStatus.types.ts'
import './KnowledgePanelStatus.css'

export function KnowledgePanelStatus({
  variant,
}: KnowledgePanelStatusProps): React.ReactElement {
  return (
    <p className={KNOWLEDGE_PANEL_STATUS_CLASS[variant]}>
      {KNOWLEDGE_PANEL_STATUS_TEXT[variant]}
    </p>
  )
}
