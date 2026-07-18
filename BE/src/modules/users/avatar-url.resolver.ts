import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AppEnvironment } from '../../config/environment.types.js'

function normalizeBaseUrl(rawBaseUrl: string): string {
  const trimmed = rawBaseUrl.trim().replace(/\/$/, '')
  if (trimmed === '' || /^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

@Injectable()
export class AvatarUrlResolver {
  private readonly cdnBaseUrl: string

  constructor(configService: ConfigService<AppEnvironment, true>) {
    this.cdnBaseUrl = normalizeBaseUrl(configService.get('AVATAR_CDN_BASE_URL', { infer: true }))
  }

  resolve(avatarKey: string | null): string | null {
    if (avatarKey === null || this.cdnBaseUrl === '') {
      return null
    }
    return `${this.cdnBaseUrl}/${avatarKey}`
  }
}
