import { Module } from '@nestjs/common'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { MessagesModule } from '../messages/messages.module.js'
import { UsersModule } from '../users/users.module.js'
import { PlanModule } from '../plans/plan.module.js'
import { DemoDataSeeder } from './demo-data.seeder.js'
import { PlanSeeder } from './plan.seeder.js'

@Module({
  imports: [UsersModule, ConversationsModule, MessagesModule, PlanModule],
  providers: [DemoDataSeeder, PlanSeeder],
})
export class DatabaseSeedModule {}
