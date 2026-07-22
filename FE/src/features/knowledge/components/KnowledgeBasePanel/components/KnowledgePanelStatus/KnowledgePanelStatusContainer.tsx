import { useKnowledgeContext } from '../../context/useKnowledgeContext.tsx'
import { KnowledgeLoadError } from '../KnowledgeLoadError/KnowledgeLoadError.tsx'
import { KnowledgePanelStatus } from './KnowledgePanelStatus.tsx'

export function KnowledgePanelStatusContainer(): React.ReactElement | null {
  const { isLoading, loadError, documents, retryLoad } = useKnowledgeContext()

  if (isLoading) {
    return <KnowledgePanelStatus variant="loading" />
  }

  if (loadError) {
    return <KnowledgeLoadError message={loadError} onRetry={retryLoad} />
  }

  if (documents.length === 0) {
    return <KnowledgePanelStatus variant="empty" />
  }

  return null
}
