import { Skeleton } from '../../components/Skeleton.tsx'

export function ConversationListSkeleton(): React.ReactElement {
  return (
    <div className="conversation-list-skeleton" aria-busy="true" aria-label="Loading conversations">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="conversation-list-skeleton__row">
          <Skeleton height="1.1rem" width="70%" />
          <Skeleton height="0.85rem" width="50%" />
        </div>
      ))}
    </div>
  )
}
