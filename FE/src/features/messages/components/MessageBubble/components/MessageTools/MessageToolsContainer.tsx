import { useMessageBubbleContext } from '../../context/useMessageBubbleContext.tsx'
import { MessageToolItem } from './components/MessageToolItem/MessageToolItem.tsx'
import { MessageTools } from './MessageTools.tsx'
import { buildToolViews } from './MessageTools.utils.ts'

export function MessageToolsContainer(): React.ReactElement | null {
  const { tools, completedTools } = useMessageBubbleContext()

  if (tools.length === 0) {
    return null
  }

  const items = buildToolViews(tools, completedTools).map((toolView) => (
    <MessageToolItem
      key={toolView.key}
      label={toolView.label}
      className={toolView.className}
    />
  ))

  return <MessageTools>{items}</MessageTools>
}
