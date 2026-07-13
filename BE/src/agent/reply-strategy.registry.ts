import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import type { ConversationType } from '../conversations/conversation.entity.js'
import type { ConversationReplyStrategy } from './reply-strategy.port.js'

// DI token for the array of registered strategies. The module collects every bound
// strategy here; this registry indexes them by conversation type.
export const REPLY_STRATEGIES = Symbol('REPLY_STRATEGIES')

@Injectable()
export class ReplyStrategyRegistry {
  private readonly strategiesByType: ReadonlyMap<ConversationType, ConversationReplyStrategy>

  constructor(@Inject(REPLY_STRATEGIES) strategies: ConversationReplyStrategy[]) {
    this.strategiesByType = new Map(
      strategies.map((strategy) => [strategy.conversationType, strategy]),
    )
  }

  // Resolves the strategy for a conversation type. Throws 404 for a type with no
  // registered strategy (e.g. posting to a 'direct' conversation via the streaming path),
  // which the participant guard would normally have already rejected.
  resolve(conversationType: ConversationType): ConversationReplyStrategy {
    const strategy = this.strategiesByType.get(conversationType)
    if (strategy === undefined) {
      throw new NotFoundException({
        code: ERROR_CODES.CONVERSATION_NOT_FOUND,
        message: `No assistant is available for ${conversationType} conversations`,
      })
    }
    return strategy
  }
}
