import { Inject, Injectable } from '@nestjs/common'
import { AGENT_TOOLS } from '../agent.tokens.js'
import type { AgentTool, AgentToolContext, AgentToolDefinition } from '../types/agent-tool.js'

@Injectable()
export class AgentToolRegistry {
  private readonly toolsByName: ReadonlyMap<string, AgentTool>

  constructor(@Inject(AGENT_TOOLS) tools: AgentTool[]) {
    this.toolsByName = new Map(tools.map((tool) => [tool.definition.name, tool]))
  }

  definitions(): AgentToolDefinition[] {
    return [...this.toolsByName.values()].map((tool) => tool.definition)
  }

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
