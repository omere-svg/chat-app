import 'reflect-metadata'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { applyGlobalApiContract, GLOBAL_API_PREFIX } from './app-http-contract.js'
import { AppModule } from './app.module.js'
import type { AppEnvironment } from './config/environment.types.js'

async function bootstrap(): Promise<void> {
  const application = await NestFactory.create(AppModule)
  const configService = application.get<ConfigService<AppEnvironment, true>>(ConfigService)

  applyGlobalApiContract(application)

  application.enableCors({
    origin: configService.get('FRONTEND_ORIGIN', { infer: true }),
    credentials: true,
  })

  const port = configService.get('PORT', { infer: true })
  await application.listen(port)

  new Logger('Bootstrap').log(`Chat API listening on http://localhost:${port}/${GLOBAL_API_PREFIX}`)
}

bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').error(
    'Failed to start application',
    error instanceof Error ? error.stack : String(error),
  )
  process.exit(1)
})
