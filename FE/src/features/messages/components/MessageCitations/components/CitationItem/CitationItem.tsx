import { CITATION_ITEM_CLASS } from './CitationItem.constants.ts'
import type { CitationItemProps } from './CitationItem.types.ts'
import './CitationItem.css'

export function CitationItem({
  panelId,
  documentName,
  scoreLabel,
  preview,
  text,
  isOpen,
  onToggle,
}: CitationItemProps): React.ReactElement {
  return (
    <li className={CITATION_ITEM_CLASS.item}>
      <button
        type="button"
        className={CITATION_ITEM_CLASS.toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className={CITATION_ITEM_CLASS.heading}>
          <span className={CITATION_ITEM_CLASS.name}>{documentName}</span>
          <span className={CITATION_ITEM_CLASS.score}>{scoreLabel}</span>
        </span>
        {!isOpen ? (
          <span className={CITATION_ITEM_CLASS.preview}>{preview}</span>
        ) : null}
      </button>
      {isOpen ? (
        <p id={panelId} className={CITATION_ITEM_CLASS.text}>
          {text}
        </p>
      ) : null}
    </li>
  )
}
