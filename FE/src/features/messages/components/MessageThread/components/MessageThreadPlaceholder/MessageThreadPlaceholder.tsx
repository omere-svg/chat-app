import { EmptyState } from '@/shared/components/EmptyState/EmptyState.tsx'
import {
  MESSAGE_THREAD_PLACEHOLDER_CLASS,
  MESSAGE_THREAD_PLACEHOLDER_TEXT,
} from './MessageThreadPlaceholder.constants.ts'
import './MessageThreadPlaceholder.css'

export function MessageThreadPlaceholder(): React.ReactElement {
  return (
    <div className={MESSAGE_THREAD_PLACEHOLDER_CLASS.root}>
      <EmptyState
        title={MESSAGE_THREAD_PLACEHOLDER_TEXT.title}
        description={MESSAGE_THREAD_PLACEHOLDER_TEXT.description}
      />
    </div>
  )
}
