import { MESSAGE_META_CLASS } from './MessageMeta.constants.ts'
import type { MessageMetaProps } from './MessageMeta.types.ts'
import './MessageMeta.css'

export function MessageMeta(props: MessageMetaProps): React.ReactElement {
  return (
    <span className={MESSAGE_META_CLASS.meta}>
      {props.variant === 'sent' ? (
        <time className={MESSAGE_META_CLASS.time} dateTime={props.dateTime}>
          {props.label}
        </time>
      ) : (
        <span
          className={MESSAGE_META_CLASS.status}
          role={props.variant === 'streaming' ? 'status' : undefined}
        >
          {props.label}
        </span>
      )}
    </span>
  )
}
