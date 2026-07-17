import { MESSAGE_TOOL_LABEL } from './MessageTools.constants.ts'
import type { MessageToolView } from './MessageTools.types.ts'

function friendlyToolLabel(toolName: string): string {
  if (toolName in MESSAGE_TOOL_LABEL) {
    return MESSAGE_TOOL_LABEL[toolName as keyof typeof MESSAGE_TOOL_LABEL]
  }
  return `Using ${toolName}`
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
    return {
      key: `${tool}-${index.toString()}`,
      label: friendlyToolLabel(tool),
      isDone: priorSameName < completedSameName,
    }
  })
}
