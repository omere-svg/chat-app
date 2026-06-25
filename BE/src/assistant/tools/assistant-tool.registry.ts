import { Inject, Injectable } from '@nestjs/common'
import { ASSISTANT_TOOLS } from './assistant-tool.port.js'
import type { AssistantTool, AssistantToolContext, AssistantToolDefinition } from './assistant-tool.port.js'

@Injectable()
export class AssistantToolRegistry {
  private readonly toolsByName: ReadonlyMap<string, AssistantTool>

  constructor(@Inject(ASSISTANT_TOOLS) tools: AssistantTool[]) {
    this.toolsByName = new Map(tools.map((tool) => [tool.definition.name, tool]))
  }

  definitions(): AssistantToolDefinition[] {
    return [...this.toolsByName.values()].map((tool) => tool.definition)
  }

  // Dispatches a tool call from the model. An unknown name returns a result the model
  // can recover from rather than throwing — the tool loop surfaces it as a tool error.
  async execute(
    name: string,
    rawInput: unknown,
    context: AssistantToolContext,
  ): Promise<unknown> {
    const tool = this.toolsByName.get(name)
    if (tool === undefined) {
      return { error: `Unknown tool: ${name}` }
    }
    return tool.execute(rawInput, context)
  }
}
