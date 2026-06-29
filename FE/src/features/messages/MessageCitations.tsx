import { useState } from 'react'
import type { Citation } from '../../types/domain.ts'

type MessageCitationsProps = {
  citations: Citation[]
}

const PREVIEW_LENGTH = 90

// A one-line, whitespace-collapsed snippet of the chunk so sources from the same
// document are distinguishable at a glance without expanding each one.
function toPreview(text: string): string {
  const collapsed = text.replace(/\s+/g, ' ').trim()
  return collapsed.length > PREVIEW_LENGTH ? `${collapsed.slice(0, PREVIEW_LENGTH)}…` : collapsed
}

// The sources a tutor answer cited, rendered as a disclosure list under the message.
// Each source is a native <button>, so Enter/Space toggle it the same as a click, and
// aria-expanded exposes the open state to assistive tech.
export function MessageCitations({
  citations,
}: MessageCitationsProps): React.ReactElement {
  const [openChunkId, setOpenChunkId] = useState<string | null>(null)

  return (
    <section className="message-citations" aria-label="Sources">
      <p className="message-citations__label">Sources ({citations.length})</p>
      <ul className="message-citations__list">
        {citations.map((citation) => {
          const isOpen = openChunkId === citation.chunkId
          const panelId = `citation-${citation.chunkId}`
          return (
            <li key={citation.chunkId} className="message-citations__item">
              <button
                type="button"
                className="message-citations__toggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenChunkId(isOpen ? null : citation.chunkId)}
              >
                <span className="message-citations__heading">
                  <span className="message-citations__name">{citation.documentName}</span>
                  <span className="message-citations__score">
                    {Math.round(citation.score * 100)}%
                  </span>
                </span>
                {!isOpen ? (
                  <span className="message-citations__preview">{toPreview(citation.text)}</span>
                ) : null}
              </button>
              {isOpen ? (
                <p id={panelId} className="message-citations__text">
                  {citation.text}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
