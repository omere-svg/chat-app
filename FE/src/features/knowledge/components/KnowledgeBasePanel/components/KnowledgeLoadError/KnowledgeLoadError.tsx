import {
  KNOWLEDGE_LOAD_ERROR_CLASS,
  KNOWLEDGE_LOAD_ERROR_TEXT,
} from './KnowledgeLoadError.constants.ts'
import type { KnowledgeLoadErrorProps } from './KnowledgeLoadError.types.ts'

export function KnowledgeLoadError({
  message,
  onRetry,
}: KnowledgeLoadErrorProps): React.ReactElement {
  return (
    <div className={KNOWLEDGE_LOAD_ERROR_CLASS.error} role="alert">
      {message}{' '}
      <button
        type="button"
        className={KNOWLEDGE_LOAD_ERROR_CLASS.retry}
        onClick={onRetry}
      >
        {KNOWLEDGE_LOAD_ERROR_TEXT.retry}
      </button>
    </div>
  )
}
