import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConversationDocument, ConversationSchema } from './conversation.schema.js'
import { ConversationsService } from './conversations.service.js'
import { MongoConversationRepository } from './repository/mongo-conversation.repository.js'
import { CONVERSATION_REPOSITORY } from './repository/conversation-repository.port.js'

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
