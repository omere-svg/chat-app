import { MESSAGE_META_CLASS } from '../../MessageMeta.constants.ts'
import type { MessageMetaTimeProps } from '../../MessageMeta.types.ts'

export function MessageMetaTime({
  label,
  dateTime,
}: MessageMetaTimeProps): React.ReactElement {
  return (
    <time className={MESSAGE_META_CLASS.time} dateTime={dateTime}>
      {label}
    </time>
  )
}
