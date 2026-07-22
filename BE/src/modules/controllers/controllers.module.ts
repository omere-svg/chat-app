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
import { RequestAvatarUploadModule } from '../request-avatar-upload/request-avatar-upload.module.js'
import { SetAvatarModule } from '../set-avatar/set-avatar.module.js'
import { RemoveAvatarModule } from '../remove-avatar/remove-avatar.module.js'
import { ListPreviousEmailsModule } from '../list-previous-emails/list-previous-emails.module.js'
import { RequestEmailChangeModule } from '../request-email-change/request-email-change.module.js'
import { ConfirmEmailChangeModule } from '../confirm-email-change/confirm-email-change.module.js'
import { RequestPasswordResetModule } from '../request-password-reset/request-password-reset.module.js'
import { ConfirmPasswordResetModule } from '../confirm-password-reset/confirm-password-reset.module.js'
import { AuthController } from './auth.controller.js'
import { CurrentUserController } from './current-user.controller.js'
import { EmailChangeController } from './email-change.controller.js'
import { PasswordResetController } from './password-reset.controller.js'
import { AvatarController } from './avatar.controller.js'
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
    RequestAvatarUploadModule,
    SetAvatarModule,
    RemoveAvatarModule,
    ListPreviousEmailsModule,
    RequestEmailChangeModule,
    ConfirmEmailChangeModule,
    RequestPasswordResetModule,
    ConfirmPasswordResetModule,
  ],
  controllers: [
    AuthController,
    CurrentUserController,
    EmailChangeController,
    PasswordResetController,
    AvatarController,
    ConversationsController,
    MessagesController,
    KnowledgeDocumentsController,
  ],
  providers: [ConversationParticipantGuard],
})
export class ControllersModule {}
