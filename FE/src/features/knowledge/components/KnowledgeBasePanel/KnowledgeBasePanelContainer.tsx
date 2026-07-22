import { KnowledgeBasePanel } from './KnowledgeBasePanel.tsx'
import { KnowledgeProvider } from './context/useKnowledgeContext.tsx'

export function KnowledgeBasePanelContainer(): React.ReactElement {
  return (
    <KnowledgeProvider>
      <KnowledgeBasePanel />
    </KnowledgeProvider>
  )
}
