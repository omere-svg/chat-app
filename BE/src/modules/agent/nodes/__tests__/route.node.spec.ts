import { describe, expect, it } from 'vitest'
import { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import { routeDecision } from '../route.node.js'
import { RETRIEVE_KNOWLEDGE_TOOL } from '../../constants.js'
import type { AgentState } from '../../types/agent-state.js'

function stateEndingWith(...messages: AgentState['messages']): AgentState {
  return { messages, retrievedChunks: [], groundingEmpty: false, toolRounds: 0 }
}

describe('routeDecision (conditional edge)', () => {
  it('routes a retrieval tool call to retrieve', () => {
    const decision = new AIMessage({
      content: '',
      tool_calls: [{ name: RETRIEVE_KNOWLEDGE_TOOL, args: { query: 'x' }, id: 'r1', type: 'tool_call' }],
    })
    expect(routeDecision(stateEndingWith(new HumanMessage('q'), decision))).toBe('retrieve')
  })

  it('routes a user-data tool call to tool_call', () => {
    const decision = new AIMessage({
      content: '',
      tool_calls: [{ name: 'list_my_conversations', args: {}, id: 'c1', type: 'tool_call' }],
    })
    expect(routeDecision(stateEndingWith(new HumanMessage('q'), decision))).toBe('tool_call')
  })

  it('routes a plain (no-tool) turn to answer', () => {
    expect(routeDecision(stateEndingWith(new HumanMessage('just chat')))).toBe('answer')
  })

  it('routes to answer after tool results (last message is a tool message)', () => {
    expect(
      routeDecision(
        stateEndingWith(
          new AIMessage({
            content: '',
            tool_calls: [{ name: 'list_my_conversations', args: {}, id: 'c1', type: 'tool_call' }],
          }),
          new ToolMessage({ tool_call_id: 'c1', name: 'list_my_conversations', content: '[]' }),
        ),
      ),
    ).toBe('answer')
  })
})
