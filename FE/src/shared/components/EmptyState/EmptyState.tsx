import { EMPTY_STATE_CLASS } from './EmptyState.constants.ts'
import type { EmptyStateProps } from './EmptyState.types.ts'
import './EmptyState.css'

export function EmptyState({
  title,
  description,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className={EMPTY_STATE_CLASS.root} role="status">
      <p className={EMPTY_STATE_CLASS.title}>{title}</p>
      {description ? (
        <p className={EMPTY_STATE_CLASS.description}>{description}</p>
      ) : null}
    </div>
  )
}
