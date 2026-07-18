import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { ConversationsModule } from '../conversations/conversations.module.js'
import { SignupModule } from '../signup/signup.module.js'
import { LoginModule } from '../login/login.module.js'
import { CurrentUserModule } from '../current-user/current-user.module.js'
import { ListConversationsModule } from '../list-conversations/list-conversations.module.js'
import { CreateConversationModule } from '../create-conversation/create-conversation.module.js'
import { ListMessagesModule } from '../list-messages/list-messages.module.js'
import { SendMessageModule } from '../send-message/send-message.module.js'
import { UploadDocumentModule } from '../upload-document/upload-document.module.js'
import { ListDocumentsModule } from '../list-documents/list-documents.module.js'
import { DeleteDocumentModule } from '../delete-document/delete-document.module.js'
import { AuthController } from './auth.controller.js'
import { CurrentUserController } from './current-user.controller.js'
import { ConversationsController } from './conversations.controller.js'
import { MessagesController } from './messages.controller.js'
import { KnowledgeDocumentsController } from './knowledge-documents.controller.js'
import { ConversationParticipantGuard } from './guard/conversation-participant.guard.js'

@Module({
  imports: [
    AuthModule,
    ConversationsModule,
    SignupModule,
    LoginModule,
    CurrentUserModule,
    ListConversationsModule,
    CreateConversationModule,
    ListMessagesModule,
    SendMessageModule,
    UploadDocumentModule,
    ListDocumentsModule,
    DeleteDocumentModule,
  ],
  controllers: [
    AuthController,
    CurrentUserController,
    ConversationsController,
    MessagesController,
    KnowledgeDocumentsController,
  ],
  providers: [ConversationParticipantGuard],
})
export class ControllersModule {}
