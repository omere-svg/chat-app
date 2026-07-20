import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DeleteObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { AVATAR_UPLOAD_URL_TTL_SECONDS } from './constants.js'
import type { AppEnvironment } from '../../config/environment.types.js'
import type {
  CreateUploadUrlInput,
  ObjectStorage,
  StoredObject,
  UploadUrl,
} from './types/object-storage.js'

function isNotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } }
  return candidate.name === 'NotFound' || candidate.$metadata?.httpStatusCode === 404
}

@Injectable()
export class S3ObjectStorage implements ObjectStorage {
  private readonly logger = new Logger(S3ObjectStorage.name)
  private readonly client: S3Client
  private readonly bucket: string

  constructor(configService: ConfigService<AppEnvironment, true>) {
    const accessKeyId = configService.get('AWS_ACCESS_KEY_ID', { infer: true })
    const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY', { infer: true })

    this.bucket = configService.get('S3_AVATAR_BUCKET', { infer: true })
    this.client = new S3Client({
      region: configService.get('AWS_REGION', { infer: true }),
      credentials:
        accessKeyId !== '' && secretAccessKey !== ''
          ? { accessKeyId, secretAccessKey }
          : undefined,
    })
  }

  async createUploadUrl({ key, contentType, maxBytes }: CreateUploadUrlInput): Promise<UploadUrl> {
    const { url, fields } = await createPresignedPost(this.client, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [
        ['content-length-range', 1, maxBytes],
        ['eq', '$Content-Type', contentType],
      ],
      Fields: { 'Content-Type': contentType },
      Expires: AVATAR_UPLOAD_URL_TTL_SECONDS,
    })
    return { url, fields, expiresInSeconds: AVATAR_UPLOAD_URL_TTL_SECONDS }
  }

  async headObject(key: string): Promise<StoredObject | null> {
    try {
      const response = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      )
      return {
        contentType: response.ContentType ?? null,
        byteSize: response.ContentLength ?? 0,
      }
    } catch (error) {
      if (isNotFound(error)) {
        return null
      }
      throw error
    }
  }

  async deleteObjectQuietly(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    } catch (error) {
      this.logger.warn(`Failed to delete object ${key}: ${String(error)}`)
    }
  }
}
