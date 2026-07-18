import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
} from '../../../shared/validation/field-constraints.constant.js'

export class UpdateEmailDto {
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email!: string

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_PASSWORD_LENGTH)
  currentPassword!: string
}
