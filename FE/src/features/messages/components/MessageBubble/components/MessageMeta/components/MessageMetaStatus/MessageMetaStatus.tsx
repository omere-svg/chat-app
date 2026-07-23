import { useMessageBubbleContext } from '../../../../context/useMessageBubbleContext.tsx'
import { MESSAGE_META_CLASS } from '../../MessageMeta.constants.ts'

export function MessageMetaStatus(): React.ReactElement {
  const { metaStatusLabel, metaIsLive } = useMessageBubbleContext()

  return (
    <span
      className={MESSAGE_META_CLASS.status}
      role={metaIsLive ? 'status' : undefined}
    >
      {metaStatusLabel}
    </span>
  )
}
