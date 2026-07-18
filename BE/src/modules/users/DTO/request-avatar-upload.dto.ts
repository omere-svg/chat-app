import { IsIn } from 'class-validator'
import { ALLOWED_AVATAR_CONTENT_TYPES } from '../avatar/constants.js'
import type { AllowedAvatarContentType } from '../avatar/types/allowed-avatar-content-type.js'

const ALLOWED_CONTENT_TYPES = Object.keys(
  ALLOWED_AVATAR_CONTENT_TYPES,
) as AllowedAvatarContentType[]

export class RequestAvatarUploadDto {
  @IsIn(ALLOWED_CONTENT_TYPES)
  contentType!: AllowedAvatarContentType
}
