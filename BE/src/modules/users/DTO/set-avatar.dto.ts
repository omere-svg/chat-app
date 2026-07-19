import { IsString, MaxLength, MinLength } from 'class-validator'

const MAX_AVATAR_KEY_LENGTH = 512

export class SetAvatarDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_AVATAR_KEY_LENGTH)
  key!: string
}
