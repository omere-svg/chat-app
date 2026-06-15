import { Module } from '@nestjs/common'
import { InMemoryMessageRepository } from './repository/in-memory-message.repository.js'
import { MESSAGE_REPOSITORY } from './repository/message-repository.port.js'
import { MessagesService } from './messages.service.js'

@Module({
  providers: [
    MessagesService,
    { provide: MESSAGE_REPOSITORY, useClass: InMemoryMessageRepository },
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
