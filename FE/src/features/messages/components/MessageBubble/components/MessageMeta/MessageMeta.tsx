import { MESSAGE_META_CLASS } from './MessageMeta.constants.ts'
import type { MessageMetaProps } from './MessageMeta.types.ts'
import './MessageMeta.css'

export function MessageMeta({ children }: MessageMetaProps): React.ReactElement {
  return <span className={MESSAGE_META_CLASS.meta}>{children}</span>
}
