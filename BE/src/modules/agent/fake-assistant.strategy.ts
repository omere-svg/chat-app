import { Injectable } from '@nestjs/common'
import type { ConversationType } from '../../modules/conversations/types/conversation.entity.js'
import type {
  AgentReplyChunk,
  ConversationReplyStrategy,
  GenerateReplyInput,
} from './types/reply-strategy.js'

@Injectable()
export class FakeAssistantStrategy implements ConversationReplyStrategy {
  readonly conversationType: ConversationType = 'assistant'

  async *generate(input: GenerateReplyInput): AsyncIterable<AgentReplyChunk> {
    const lastUserMessage = [...input.history].reverse().find((turn) => turn.role === 'user')
    const reply = `Echo: ${lastUserMessage?.content ?? ''}`.trim()

    await Promise.resolve()
    for (const word of reply.split(' ')) {
      if (input.signal.aborted) {
        return
      }
      yield { type: 'text-delta', text: `${word} ` }
    }
  }
}
