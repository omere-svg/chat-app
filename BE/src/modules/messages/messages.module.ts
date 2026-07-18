import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MessageDocument, MessageSchema } from './message.schema.js'
import { MongoMessageRepository } from './message.mongo.repository.js'
import { MESSAGE_REPOSITORY } from './message.repository.js'
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
