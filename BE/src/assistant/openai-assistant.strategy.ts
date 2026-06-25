import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { AssistantToolRegistry } from './tools/assistant-tool.registry.js'
import { ASSISTANT_SYSTEM_PROMPT } from './prompts/assistant-system-prompt.js'
import type { ConversationType } from '../conversations/conversation.entity.js'
import type { AppEnvironment } from '../config/environment.types.js'
import type {
  AssistantReplyChunk,
  ConversationReplyStrategy,
  GenerateReplyInput,
} from './reply-strategy.port.js'

// Bound to at most this many tool-call rounds per turn before a final, tools-disabled
// completion is forced — caps cost and prevents pathological tool loops.
const MAX_TOOL_ROUNDS = 3

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam

interface AccumulatedToolCall {
  id: string
  name: string
  arguments: string
}

interface ToolRoundResult {
  toolCalls: AccumulatedToolCall[]
}

@Injectable()
export class OpenAiAssistantStrategy implements ConversationReplyStrategy {
  readonly conversationType: ConversationType = 'assistant'
  private readonly client: OpenAI
  private readonly model: string
  private readonly maxTokens: number

  constructor(
    private readonly configService: ConfigService<AppEnvironment, true>,
    private readonly toolRegistry: AssistantToolRegistry,
  ) {
    this.client = new OpenAI({ apiKey: this.configService.get('OPENAI_API_KEY', { infer: true }) })
    this.model = this.configService.get('ASSISTANT_MODEL', { infer: true })
    this.maxTokens = this.configService.get('ASSISTANT_MAX_TOKENS', { infer: true })
  }

  async *generate(input: GenerateReplyInput): AsyncIterable<AssistantReplyChunk> {
    const messages: ChatMessage[] = [
      { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
      ...input.history.map(
        (turn): ChatMessage => ({ role: turn.role, content: turn.content }),
      ),
    ]

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const { toolCalls } = yield* this.streamRound(messages, input.signal, true)
      if (toolCalls.length === 0) {
        return
      }

      messages.push(toAssistantToolCallMessage(toolCalls))
      for (const toolCall of toolCalls) {
        if (input.signal.aborted) {
          return
        }
        yield { type: 'tool-invoked', name: toolCall.name }
        const result = await this.toolRegistry.execute(
          toolCall.name,
          parseToolArguments(toolCall.arguments),
          { userId: input.userId },
        )
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        })
      }
    }

    // Tool rounds exhausted while the model still wanted tools: force a final answer
    // by streaming one more completion with tools disabled.
    yield* this.streamRound(messages, input.signal, false)
  }

  private async *streamRound(
    messages: ChatMessage[],
    signal: AbortSignal,
    allowTools: boolean,
  ): AsyncGenerator<AssistantReplyChunk, ToolRoundResult> {
    const toolsEnabled = allowTools && this.toolRegistry.definitions().length > 0
    const stream = await this.client.chat.completions.create(
      {
        model: this.model,
        max_completion_tokens: this.maxTokens,
        stream: true,
        messages,
        ...(toolsEnabled
          ? {
              tools: this.toolRegistry.definitions().map((definition) => ({
                type: 'function' as const,
                function: {
                  name: definition.name,
                  description: definition.description,
                  parameters: definition.parameters,
                },
              })),
              tool_choice: 'auto' as const,
            }
          : {}),
      },
      { signal },
    )

    const toolCallsByIndex = new Map<number, AccumulatedToolCall>()
    for await (const chunk of stream) {
      if (signal.aborted) {
        break
      }
      const delta = chunk.choices[0]?.delta
      if (delta?.content) {
        yield { type: 'text-delta', text: delta.content }
      }
      for (const toolCallDelta of delta?.tool_calls ?? []) {
        const accumulated = toolCallsByIndex.get(toolCallDelta.index) ?? {
          id: '',
          name: '',
          arguments: '',
        }
        if (toolCallDelta.id) {
          accumulated.id = toolCallDelta.id
        }
        if (toolCallDelta.function?.name) {
          accumulated.name = toolCallDelta.function.name
        }
        if (toolCallDelta.function?.arguments) {
          accumulated.arguments += toolCallDelta.function.arguments
        }
        toolCallsByIndex.set(toolCallDelta.index, accumulated)
      }
    }

    return { toolCalls: [...toolCallsByIndex.values()].filter((call) => call.name.length > 0) }
  }
}

function toAssistantToolCallMessage(toolCalls: AccumulatedToolCall[]): ChatMessage {
  return {
    role: 'assistant',
    content: null,
    tool_calls: toolCalls.map((toolCall) => ({
      id: toolCall.id,
      type: 'function' as const,
      function: { name: toolCall.name, arguments: toolCall.arguments },
    })),
  }
}

// Tool-call arguments arrive as a JSON string streamed in fragments; an empty or
// malformed payload degrades to {} so the tool's own schema validation reports the issue.
function parseToolArguments(rawArguments: string): unknown {
  if (rawArguments.trim().length === 0) {
    return {}
  }
  try {
    return JSON.parse(rawArguments)
  } catch {
    return {}
  }
}
