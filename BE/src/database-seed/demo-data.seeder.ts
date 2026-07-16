import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { OnModuleInit } from '@nestjs/common'
import { CONVERSATION_REPOSITORY } from '../conversations/repository/conversation-repository.port.js'
import { MESSAGE_REPOSITORY } from '../messages/repository/message-repository.port.js'
import { PasswordHasher } from '../users/password-hasher.js'
import { USER_REPOSITORY } from '../users/repository/user-repository.port.js'
import { CHAT_SEED, DEMO_USERS, DEMO_USER_PASSWORD } from '../shared/seed/chat-seed.js'
import type { ConversationRepository } from '../conversations/repository/conversation-repository.port.js'
import type { MessageRepository } from '../messages/repository/message-repository.port.js'
import type { UserRepository } from '../users/repository/user-repository.port.js'
import type { AppEnvironment } from '../config/environment.types.js'

@Injectable()
export class DemoDataSeeder implements OnModuleInit {
  private readonly logger = new Logger(DemoDataSeeder.name)

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(CONVERSATION_REPOSITORY) private readonly conversationRepository: ConversationRepository,
    @Inject(MESSAGE_REPOSITORY) private readonly messageRepository: MessageRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly configService: ConfigService<AppEnvironment, true>,
  ) {}

  async onModuleInit(): Promise<void> {
    // Demo fixtures are a development/test convenience; never seed real environments.
    if (this.configService.get('NODE_ENV', { infer: true }) === 'production') {
      return
    }

    await this.seedUsers()
    await this.seedConversations()
    await this.seedMessages()
  }

  private async seedUsers(): Promise<void> {
    if (!(await this.userRepository.isEmpty())) {
      return
    }

    const passwordHash = await this.passwordHasher.hash(DEMO_USER_PASSWORD)
    for (const demoUser of DEMO_USERS) {
      await this.userRepository.insert({
        id: demoUser.id,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        passwordHash,
      })
    }
    this.logger.log(`Seeded ${DEMO_USERS.length.toString()} demo users`)
  }

  private async seedConversations(): Promise<void> {
    if (!(await this.conversationRepository.isEmpty())) {
      return
    }

    for (const conversation of CHAT_SEED.conversations) {
      await this.conversationRepository.insert(conversation)
    }
    this.logger.log(`Seeded ${CHAT_SEED.conversations.length.toString()} demo conversations`)
  }

  private async seedMessages(): Promise<void> {
    if (!(await this.messageRepository.isEmpty())) {
      return
    }

    let seededCount = 0
    for (const messages of CHAT_SEED.messagesByConversationId.values()) {
      for (const message of messages) {
        await this.messageRepository.insert(message)
        seededCount += 1
      }
    }
    this.logger.log(`Seeded ${seededCount.toString()} demo messages`)
  }
}
