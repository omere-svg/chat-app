import { MESSAGE_TOOL_LABEL } from './MessageTools.constants.ts'
import {
  MESSAGE_TOOL_ITEM_CLASS,
  MESSAGE_TOOL_ITEM_TEXT,
} from './components/MessageToolItem/MessageToolItem.constants.ts'
import type { MessageToolView } from './MessageTools.types.ts'

function friendlyToolLabel(toolName: string): string {
  if (toolName in MESSAGE_TOOL_LABEL) {
    return MESSAGE_TOOL_LABEL[toolName as keyof typeof MESSAGE_TOOL_LABEL]
  }
  return `Using ${toolName}`
}

function toolItemClassName(isDone: boolean): string {
  return isDone
    ? `${MESSAGE_TOOL_ITEM_CLASS.item} ${MESSAGE_TOOL_ITEM_CLASS.done}`
    : MESSAGE_TOOL_ITEM_CLASS.item
}

function toolItemLabel(baseLabel: string, isDone: boolean): string {
  return isDone ? baseLabel : `${baseLabel}${MESSAGE_TOOL_ITEM_TEXT.pendingSuffix}`
}

export function buildToolViews(
  tools: string[],
  completedTools: string[],
): MessageToolView[] {
  return tools.map((tool, index) => {
    const priorSameName = tools
      .slice(0, index)
      .filter((name) => name === tool).length
    const completedSameName = completedTools.filter(
      (name) => name === tool,
    ).length
    const isDone = priorSameName < completedSameName
    return {
      key: `${tool}-${index.toString()}`,
      label: toolItemLabel(friendlyToolLabel(tool), isDone),
      className: toolItemClassName(isDone),
    }
  })
}
