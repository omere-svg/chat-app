import { useKnowledgeContext } from '../../context/useKnowledgeContext.tsx'
import { KnowledgeDocumentItem } from './components/KnowledgeDocumentItem/KnowledgeDocumentItem.tsx'
import { KnowledgeDocumentList } from './KnowledgeDocumentList.tsx'

export function KnowledgeDocumentListContainer(): React.ReactElement | null {
  const { documents } = useKnowledgeContext()

  if (documents.length === 0) {
    return null
  }

  const items = documents.map((document) => (
    <KnowledgeDocumentItem key={document.id} document={document} />
  ))

  return <KnowledgeDocumentList>{items}</KnowledgeDocumentList>
}
