import { useState } from 'react'
import { useMessageBubbleContext } from '../MessageBubble/context/useMessageBubbleContext.tsx'
import { CitationItem } from './components/CitationItem/CitationItem.tsx'
import { MessageCitations } from './MessageCitations.tsx'
import { formatCitationPreview } from './MessageCitations.utils.ts'

export function MessageCitationsContainer(): React.ReactElement | null {
  const { citations } = useMessageBubbleContext()
  const [openChunkId, setOpenChunkId] = useState<string | null>(null)

  if (citations.length === 0) {
    return null
  }

  const items = citations.map((citation) => {
    const isOpen = openChunkId === citation.chunkId
    return (
      <CitationItem
        key={citation.chunkId}
        panelId={`citation-${citation.chunkId}`}
        documentName={citation.documentName}
        scoreLabel={`${Math.round(citation.score * 100).toString()}%`}
        preview={formatCitationPreview(citation.text)}
        text={citation.text}
        isOpen={isOpen}
        onToggle={() => setOpenChunkId(isOpen ? null : citation.chunkId)}
      />
    )
  })

  return <MessageCitations count={citations.length}>{items}</MessageCitations>
}
