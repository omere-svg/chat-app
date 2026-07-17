import { MessageToolItem } from './components/MessageToolItem/MessageToolItem.tsx'
import { MessageTools } from './MessageTools.tsx'
import type { MessageToolsContainerProps } from './MessageTools.types.ts'
import { buildToolViews } from './MessageTools.utils.ts'

export function MessageToolsContainer({
  tools,
  completedTools,
}: MessageToolsContainerProps): React.ReactElement {
  const items = buildToolViews(tools, completedTools).map((toolView) => (
    <MessageToolItem
      key={toolView.key}
      label={toolView.label}
      isDone={toolView.isDone}
    />
  ))

  return <MessageTools items={items} />
}
