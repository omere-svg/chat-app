import { Type, plainToInstance } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, IsUrl, Matches, Max, Min, MinLength, validateSync } from 'class-validator'
import type { ValidationError } from 'class-validator'
import { DEFAULT_ATLAS_VECTOR_INDEX } from '../modules/knowledge-rag/atlas/vector-index.config.js'
import type { AppEnvironment, NodeEnvironment } from './environment.types.js'

const MIN_JWT_SECRET_LENGTH = 32
const MIN_TCP_PORT = 1
const MAX_TCP_PORT = 65_535
const MIN_JWT_EXPIRY_SECONDS = 60
const MAX_JWT_EXPIRY_SECONDS = 60 * 60 * 24 * 30

const MIN_ASSISTANT_MAX_TOKENS = 256
const MAX_ASSISTANT_MAX_TOKENS = 16_384
const DEFAULT_ASSISTANT_MODEL = 'gpt-4o-mini'
const DEFAULT_ASSISTANT_MAX_TOKENS = 1024
const DEFAULT_EMBEDDINGS_MODEL = 'text-embedding-3-small'
const DEFAULT_AWS_REGION = 'us-east-1'

const NODE_ENVIRONMENTS: readonly NodeEnvironment[] = ['development', 'test', 'production']
const DEFAULT_NODE_ENV: NodeEnvironment = 'development'

class EnvironmentVariablesSchema implements AppEnvironment {
  @IsOptional()
  @IsIn(NODE_ENVIRONMENTS)
  NODE_ENV!: NodeEnvironment

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

  @IsString()
  @Matches(/^mongodb(\+srv)?:\/\//, {
    message: 'MONGO_URI must be a mongodb:// or mongodb+srv:// connection string',
  })
  MONGO_URI!: string

  @IsString()
  @MinLength(1)
  OPENAI_API_KEY!: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  ASSISTANT_MODEL!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_ASSISTANT_MAX_TOKENS)
  @Max(MAX_ASSISTANT_MAX_TOKENS)
  ASSISTANT_MAX_TOKENS!: number

  @IsOptional()
  @IsString()
  @MinLength(1)
  EMBEDDINGS_MODEL!: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  ATLAS_VECTOR_INDEX!: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  AWS_REGION!: string

  @IsOptional()
  @IsString()
  S3_AVATAR_BUCKET!: string

  @IsOptional()
  @IsString()
  AWS_ACCESS_KEY_ID!: string

  @IsOptional()
  @IsString()
  AWS_SECRET_ACCESS_KEY!: string

  @IsOptional()
  @IsUrl({ require_tld: false })
  AVATAR_CDN_BASE_URL!: string
}

const REQUIRED_STORAGE_KEYS: readonly (keyof AppEnvironment)[] = [
  'S3_AVATAR_BUCKET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AVATAR_CDN_BASE_URL',
]

function assertStorageConfiguredInProduction(environment: AppEnvironment): void {
  if (environment.NODE_ENV !== 'production') {
    return
  }

  const missingKeys = REQUIRED_STORAGE_KEYS.filter((key) => environment[key] === '')
  if (missingKeys.length > 0) {
    throw new Error(`Invalid environment configuration: missing ${missingKeys.join(', ')}`)
  }
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

  const resolvedEnvironment: AppEnvironment = {
    NODE_ENV: candidateEnvironment.NODE_ENV ?? DEFAULT_NODE_ENV,
    PORT: candidateEnvironment.PORT,
    FRONTEND_ORIGIN: candidateEnvironment.FRONTEND_ORIGIN,
    JWT_SECRET: candidateEnvironment.JWT_SECRET,
    JWT_EXPIRES_IN: candidateEnvironment.JWT_EXPIRES_IN,
    MONGO_URI: candidateEnvironment.MONGO_URI,
    OPENAI_API_KEY: candidateEnvironment.OPENAI_API_KEY,
    ASSISTANT_MODEL: candidateEnvironment.ASSISTANT_MODEL ?? DEFAULT_ASSISTANT_MODEL,
    ASSISTANT_MAX_TOKENS: candidateEnvironment.ASSISTANT_MAX_TOKENS ?? DEFAULT_ASSISTANT_MAX_TOKENS,
    EMBEDDINGS_MODEL: candidateEnvironment.EMBEDDINGS_MODEL ?? DEFAULT_EMBEDDINGS_MODEL,
    ATLAS_VECTOR_INDEX: candidateEnvironment.ATLAS_VECTOR_INDEX ?? DEFAULT_ATLAS_VECTOR_INDEX,
    AWS_REGION: candidateEnvironment.AWS_REGION ?? DEFAULT_AWS_REGION,
    S3_AVATAR_BUCKET: candidateEnvironment.S3_AVATAR_BUCKET ?? '',
    AWS_ACCESS_KEY_ID: candidateEnvironment.AWS_ACCESS_KEY_ID ?? '',
    AWS_SECRET_ACCESS_KEY: candidateEnvironment.AWS_SECRET_ACCESS_KEY ?? '',
    AVATAR_CDN_BASE_URL: candidateEnvironment.AVATAR_CDN_BASE_URL ?? '',
  }

  assertStorageConfiguredInProduction(resolvedEnvironment)

  return resolvedEnvironment
}
