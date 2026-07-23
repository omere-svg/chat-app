import { Module } from '@nestjs/common'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { MessagesModule } from '../messages/messages.module.js'
import { UsersModule } from '../users/users.module.js'
import { DemoDataSeeder } from './demo-data.seeder.js'

@Module({
  imports: [UsersModule, ConversationsModule, MessagesModule],
  providers: [DemoDataSeeder],
})
export class DatabaseSeedModule {}
