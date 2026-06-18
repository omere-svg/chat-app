import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MessageDocument, MessageSchema } from './message.schema.js'
import { MongoMessageRepository } from './repository/mongo-message.repository.js'
import { MESSAGE_REPOSITORY } from './repository/message-repository.port.js'
import { MessagesService } from './messages.service.js'

@Module({
  imports: [MongooseModule.forFeature([{ name: MessageDocument.name, schema: MessageSchema }])],
  providers: [
    MessagesService,
    { provide: MESSAGE_REPOSITORY, useClass: MongoMessageRepository },
  ],
  exports: [MessagesService, MESSAGE_REPOSITORY],
})
export class MessagesModule {}
