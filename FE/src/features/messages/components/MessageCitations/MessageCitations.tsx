import {
  MESSAGE_CITATIONS_CLASS,
  MESSAGE_CITATIONS_TEXT,
} from './MessageCitations.constants.ts'
import type { MessageCitationsProps } from './MessageCitations.types.ts'
import './MessageCitations.css'

export function MessageCitations({
  count,
  children,
}: MessageCitationsProps): React.ReactElement {
  return (
    <section
      className={MESSAGE_CITATIONS_CLASS.section}
      aria-label={MESSAGE_CITATIONS_TEXT.ariaLabel}
    >
      <p className={MESSAGE_CITATIONS_CLASS.label}>
        {MESSAGE_CITATIONS_TEXT.sourcesLabel(count)}
      </p>
      <ul className={MESSAGE_CITATIONS_CLASS.list}>{children}</ul>
    </section>
  )
}
