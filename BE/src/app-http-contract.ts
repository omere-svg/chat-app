import { ValidationPipe } from '@nestjs/common'
import type { INestApplication } from '@nestjs/common'
import { StructuredExceptionFilter } from './shared/errors/structured-exception.filter.js'

export const GLOBAL_API_PREFIX = 'api'

export function applyGlobalApiContract(application: INestApplication): void {
  application.setGlobalPrefix(GLOBAL_API_PREFIX)

  application.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  application.useGlobalFilters(new StructuredExceptionFilter())
}
