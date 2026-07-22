import { useKnowledgeContext } from '../../context/useKnowledgeContext.tsx'
import {
  KNOWLEDGE_LOAD_ERROR_CLASS,
  KNOWLEDGE_LOAD_ERROR_TEXT,
} from './KnowledgeLoadError.constants.ts'

export function KnowledgeLoadError(): React.ReactElement {
  const { loadError, retryLoad } = useKnowledgeContext()

  return (
    <div className={KNOWLEDGE_LOAD_ERROR_CLASS.error} role="alert">
      {loadError}{' '}
      <button
        type="button"
        className={KNOWLEDGE_LOAD_ERROR_CLASS.retry}
        onClick={retryLoad}
      >
        {KNOWLEDGE_LOAD_ERROR_TEXT.retry}
      </button>
    </div>
  )
}
