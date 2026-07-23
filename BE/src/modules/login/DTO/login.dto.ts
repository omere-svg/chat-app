import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
} from '../../../shared/validation/field-constraints.constants.js'
import { MIN_LOGIN_PASSWORD_LENGTH } from '../constants.js'

export class LoginDto {
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email!: string

  @IsString()
  @MinLength(MIN_LOGIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  password!: string
}
