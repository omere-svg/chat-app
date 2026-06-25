import { Injectable } from '@nestjs/common'
import type { ConversationType } from '../conversations/conversation.entity.js'
import type {
  AssistantReplyChunk,
  ConversationReplyStrategy,
  GenerateReplyInput,
} from './reply-strategy.port.js'

// Deterministic stand-in for the OpenAI strategy, bound in tests so CI never calls a
// real LLM. Streams a short, predictable reply word-by-word and honors the abort signal.
@Injectable()
export class FakeAssistantStrategy implements ConversationReplyStrategy {
  readonly conversationType: ConversationType = 'assistant'

  async *generate(input: GenerateReplyInput): AsyncIterable<AssistantReplyChunk> {
    const lastUserMessage = [...input.history].reverse().find((turn) => turn.role === 'user')
    const reply = `Echo: ${lastUserMessage?.content ?? ''}`.trim()

    // Yield to the event loop so the fake streams asynchronously like the real strategy.
    await Promise.resolve()
    for (const word of reply.split(' ')) {
      if (input.signal.aborted) {
        return
      }
      yield { type: 'text-delta', text: `${word} ` }
    }
  }
}
