import { Inject, Injectable } from '@nestjs/common'
import { AGENT_TOOLS } from './agent-tool.port.js'
import type { AgentTool, AgentToolContext, AgentToolDefinition } from './agent-tool.port.js'

@Injectable()
export class AgentToolRegistry {
  private readonly toolsByName: ReadonlyMap<string, AgentTool>

  constructor(@Inject(AGENT_TOOLS) tools: AgentTool[]) {
    this.toolsByName = new Map(tools.map((tool) => [tool.definition.name, tool]))
  }

  definitions(): AgentToolDefinition[] {
    return [...this.toolsByName.values()].map((tool) => tool.definition)
  }

  // Dispatches a tool call from the model. An unknown name returns a result the model
  // can recover from rather than throwing — the tool loop surfaces it as a tool error.
  async execute(
    name: string,
    rawInput: unknown,
    context: AgentToolContext,
  ): Promise<unknown> {
    const tool = this.toolsByName.get(name)
    if (tool === undefined) {
      return { error: `Unknown tool: ${name}` }
    }
    return tool.execute(rawInput, context)
  }
}
