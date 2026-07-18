import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import type { MongooseModuleOptions } from '@nestjs/mongoose'
import type { AppEnvironment } from '../../config/environment.types.js'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnvironment, true>): MongooseModuleOptions => ({
        uri: configService.get('MONGO_URI', { infer: true }),
      }),
    }),
  ],
})
export class DbModule {}
