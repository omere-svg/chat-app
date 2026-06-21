import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { validateEnvironment } from './config/environment.schema.js'
import { AuthModule } from './auth/auth.module.js'
import { ChatModule } from './chat/chat.module.js'
import { ConversationsModule } from './conversations/conversations.module.js'
import { DatabaseSeedModule } from './database-seed/database-seed.module.js'
import { MessagesModule } from './messages/messages.module.js'
import { UsersModule } from './users/users.module.js'
import type { MongooseModuleOptions } from '@nestjs/mongoose'
import type { AppEnvironment } from './config/environment.types.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Tests are hermetic: they read only process.env (the vitest env block plus
      // the per-run mongodb-memory-server URI), never a developer's local .env.
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvironment, true>): MongooseModuleOptions => ({
        uri: configService.get('MONGO_URI', { infer: true }),
      }),
    }),
    UsersModule,
    AuthModule,
    ConversationsModule,
    MessagesModule,
    ChatModule,
    DatabaseSeedModule,
  ],
})
export class AppModule {}
