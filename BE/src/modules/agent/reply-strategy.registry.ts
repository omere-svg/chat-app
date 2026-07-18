import { Inject, Injectable } from '@nestjs/common'
import { REPLY_STRATEGIES } from './agent.tokens.js'
import { NoReplyStrategyError } from './errors/no-reply-strategy.error.js'
import type { ConversationType } from '../../modules/conversations/types/conversation.entity.js'
import type { ConversationReplyStrategy } from './types/reply-strategy.js'

@Injectable()
export class ReplyStrategyRegistry {
  private readonly strategiesByType: ReadonlyMap<ConversationType, ConversationReplyStrategy>

  constructor(@Inject(REPLY_STRATEGIES) strategies: ConversationReplyStrategy[]) {
    this.strategiesByType = new Map(
      strategies.map((strategy) => [strategy.conversationType, strategy]),
    )
  }

  resolve(conversationType: ConversationType): ConversationReplyStrategy {
    const strategy = this.strategiesByType.get(conversationType)
    if (strategy === undefined) {
      throw new NoReplyStrategyError(conversationType)
    }
    return strategy
  }
}
