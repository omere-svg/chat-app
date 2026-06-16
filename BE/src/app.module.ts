import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnvironment } from './config/environment.schema.js'
import { AuthModule } from './auth/auth.module.js'
import { ChatModule } from './chat/chat.module.js'
import { ConversationsModule } from './conversations/conversations.module.js'
import { MessagesModule } from './messages/messages.module.js'
import { UsersModule } from './users/users.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    UsersModule,
    AuthModule,
    ConversationsModule,
    MessagesModule,
    ChatModule,
  ],
})
export class AppModule {}
