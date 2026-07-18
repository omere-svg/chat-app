import { Module } from '@nestjs/common'
import { MessagesModule } from '../messages/messages.module.js'
import { ListMessagesOrchestrator } from './list-messages.orchestrator.js'

@Module({
  imports: [MessagesModule],
  providers: [ListMessagesOrchestrator],
  exports: [ListMessagesOrchestrator],
})
export class ListMessagesModule {}
