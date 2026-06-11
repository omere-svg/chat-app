import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnvironment } from './config/environment.schema.js'
import { AuthModule } from './auth/auth.module.js'
import { ConversationsModule } from './conversations/conversations.module.js'
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
  ],
})
export class AppModule {}
