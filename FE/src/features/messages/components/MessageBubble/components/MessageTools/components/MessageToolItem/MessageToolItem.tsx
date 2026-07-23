import type { MessageToolItemProps } from './MessageToolItem.types.ts'
import './MessageToolItem.css'

export function MessageToolItem({
  label,
  className,
}: MessageToolItemProps): React.ReactElement {
  return <li className={className}>{label}</li>
}
