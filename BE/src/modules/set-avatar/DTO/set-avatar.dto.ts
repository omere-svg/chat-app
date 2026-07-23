import { IsString, MaxLength, MinLength } from 'class-validator'
import { MAX_AVATAR_KEY_LENGTH } from '../constants.js'

export class SetAvatarDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_AVATAR_KEY_LENGTH)
  key!: string
}
