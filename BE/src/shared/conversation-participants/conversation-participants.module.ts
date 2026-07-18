import { Module } from '@nestjs/common'
import { UsersModule } from '../../modules/users/users.module.js'
import { ConversationParticipantsMapper } from './conversation-participants.mapper.js'

@Module({
  imports: [UsersModule],
  providers: [ConversationParticipantsMapper],
  exports: [ConversationParticipantsMapper],
})
export class ConversationParticipantsModule {}
