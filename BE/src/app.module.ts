import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnvironment } from './config/environment.schema.js'
import { DbModule } from './modules/db/db.module.js'
import { ControllersModule } from './modules/controllers/controllers.module.js'
import { DatabaseSeedModule } from './modules/database-seed/database-seed.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      validate: validateEnvironment,
    }),
    DbModule,
    ControllersModule,
    DatabaseSeedModule,
  ],
})
export class AppModule {}
