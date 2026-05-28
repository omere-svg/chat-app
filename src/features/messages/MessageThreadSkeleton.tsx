import { Skeleton } from '../../components/Skeleton.tsx'

export function MessageThreadSkeleton(): React.ReactElement {
  return (
    <div className="message-thread-skeleton" aria-busy="true" aria-label="Loading messages">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={`message-thread-skeleton__row${i % 2 === 0 ? '' : ' message-thread-skeleton__row--right'}`}
        >
          <Skeleton height="2.5rem" width={i % 2 === 0 ? '55%' : '45%'} />
        </div>
      ))}
    </div>
  )
}
