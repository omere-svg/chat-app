import { useMessageBubbleContext } from '../../../../context/useMessageBubbleContext.tsx'
import { MESSAGE_META_CLASS } from '../../MessageMeta.constants.ts'

export function MessageMetaTime(): React.ReactElement {
  const { metaTimeLabel, metaDateTime } = useMessageBubbleContext()

  return (
    <time className={MESSAGE_META_CLASS.time} dateTime={metaDateTime}>
      {metaTimeLabel}
    </time>
  )
}
