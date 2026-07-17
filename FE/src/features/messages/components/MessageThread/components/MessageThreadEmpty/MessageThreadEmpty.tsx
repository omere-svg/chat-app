import { EmptyState } from '@/shared/components/EmptyState/EmptyState.tsx'
import { MESSAGE_THREAD_EMPTY_TEXT } from './MessageThreadEmpty.constants.ts'

export function MessageThreadEmpty(): React.ReactElement {
  return (
    <EmptyState
      title={MESSAGE_THREAD_EMPTY_TEXT.title}
      description={MESSAGE_THREAD_EMPTY_TEXT.description}
    />
  )
}
