import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { OnModuleInit } from '@nestjs/common'
import { ConversationsService } from '../conversations/conversations.service.js'
import { MessagesService } from '../messages/messages.service.js'
import { UsersService } from '../users/users.service.js'
import { CHAT_SEED, DEMO_USERS, DEMO_USER_PASSWORD } from '../../shared/seed/chat-seed.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type { MessageRecord } from '../messages/types/message.entity.js'

@Injectable()
export class DemoDataSeeder implements OnModuleInit {
  private readonly logger = new Logger(DemoDataSeeder.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.configService.get('NODE_ENV', { infer: true }) === 'production') {
      return
    }

    const seededUsers = await this.usersService.seedDemoUsersIfEmpty(DEMO_USERS, DEMO_USER_PASSWORD)
    if (seededUsers > 0) {
      this.logger.log(`Seeded ${seededUsers.toString()} demo users`)
    }

    const seededConversations = await this.conversationsService.seedIfEmpty(CHAT_SEED.conversations)
    if (seededConversations > 0) {
      this.logger.log(`Seeded ${seededConversations.toString()} demo conversations`)
    }

    const seededMessages = await this.messagesService.seedIfEmpty(this.collectSeedMessages())
    if (seededMessages > 0) {
      this.logger.log(`Seeded ${seededMessages.toString()} demo messages`)
    }
  }

  private collectSeedMessages(): MessageRecord[] {
    const messages: MessageRecord[] = []
    for (const conversationMessages of CHAT_SEED.messagesByConversationId.values()) {
      messages.push(...conversationMessages)
    }
    return messages
  }
}
