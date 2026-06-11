import { Type, plainToInstance } from 'class-transformer'
import { IsInt, IsString, IsUrl, Max, Min, MinLength, validateSync } from 'class-validator'
import type { ValidationError } from 'class-validator'
import type { AppEnvironment } from './environment.types.js'

const MIN_JWT_SECRET_LENGTH = 32
const MIN_TCP_PORT = 1
const MAX_TCP_PORT = 65_535
const MIN_JWT_EXPIRY_SECONDS = 60
const MAX_JWT_EXPIRY_SECONDS = 60 * 60 * 24 * 30

class EnvironmentVariablesSchema implements AppEnvironment {
  @Type(() => Number)
  @IsInt()
  @Min(MIN_TCP_PORT)
  @Max(MAX_TCP_PORT)
  PORT!: number

  @IsUrl({ require_tld: false })
  FRONTEND_ORIGIN!: string

  @IsString()
  @MinLength(MIN_JWT_SECRET_LENGTH)
  JWT_SECRET!: string

  @Type(() => Number)
  @IsInt()
  @Min(MIN_JWT_EXPIRY_SECONDS)
  @Max(MAX_JWT_EXPIRY_SECONDS)
  JWT_EXPIRES_IN!: number
}

function formatValidationFailures(validationErrors: readonly ValidationError[]): string {
  return validationErrors
    .map((validationError) => {
      const constraintMessages = Object.values(validationError.constraints ?? {})
      const reason = constraintMessages.length > 0 ? constraintMessages.join(', ') : 'is invalid'
      return `${validationError.property} ${reason}`
    })
    .join('; ')
}

export function validateEnvironment(rawEnvironment: Record<string, unknown>): AppEnvironment {
  const candidateEnvironment = plainToInstance(EnvironmentVariablesSchema, rawEnvironment, {
    enableImplicitConversion: false,
  })

  const validationErrors = validateSync(candidateEnvironment, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
  })

  if (validationErrors.length > 0) {
    throw new Error(
      `Invalid environment configuration: ${formatValidationFailures(validationErrors)}`,
    )
  }

  return {
    PORT: candidateEnvironment.PORT,
    FRONTEND_ORIGIN: candidateEnvironment.FRONTEND_ORIGIN,
    JWT_SECRET: candidateEnvironment.JWT_SECRET,
    JWT_EXPIRES_IN: candidateEnvironment.JWT_EXPIRES_IN,
  }
}
