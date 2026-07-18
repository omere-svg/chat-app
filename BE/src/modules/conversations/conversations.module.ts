import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConversationDocument, ConversationSchema } from './conversation.schema.js'
import { ConversationsService } from './conversations.service.js'
import { MongoConversationRepository } from './conversation.mongo.repository.js'
import { CONVERSATION_REPOSITORY } from './conversation.repository.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversationDocument.name, schema: ConversationSchema },
    ]),
  ],
  providers: [
    ConversationsService,
    { provide: CONVERSATION_REPOSITORY, useClass: MongoConversationRepository },
  ],
  exports: [ConversationsService, CONVERSATION_REPOSITORY],
})
export class ConversationsModule {}
