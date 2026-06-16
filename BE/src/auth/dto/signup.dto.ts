import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  NON_WHITESPACE_PATTERN,
} from '../../shared/validation/field-constraints.constant.js'

const MIN_PASSWORD_LENGTH = 8
const MAX_DISPLAY_NAME_LENGTH = 80

export class SignupDto {
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email!: string

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  password!: string

  @IsString()
  @MaxLength(MAX_DISPLAY_NAME_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'name must not be blank' })
  name!: string
}
