import { MESSAGE_META_CLASS } from '../../MessageMeta.constants.ts'
import type { MessageMetaStatusProps } from '../../MessageMeta.types.ts'

export function MessageMetaStatus({
  label,
  isLive,
}: MessageMetaStatusProps): React.ReactElement {
  return (
    <span className={MESSAGE_META_CLASS.status} role={isLive ? 'status' : undefined}>
      {label}
    </span>
  )
}
