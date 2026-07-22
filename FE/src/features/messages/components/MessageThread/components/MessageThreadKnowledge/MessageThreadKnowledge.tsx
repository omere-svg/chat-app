import { KnowledgeBasePanelContainer } from '@/features/knowledge/components/KnowledgeBasePanel/KnowledgeBasePanelContainer.tsx'
import { useMessageThreadContext } from '../../context/useMessageThreadContext.tsx'

export function MessageThreadKnowledge(): React.ReactElement | null {
  const { isTutorConversation } = useMessageThreadContext()

  if (!isTutorConversation) {
    return null
  }

  return <KnowledgeBasePanelContainer />
}
