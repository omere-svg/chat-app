import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  NON_WHITESPACE_PATTERN,
} from '../../../shared/validation/field-constraints.constant.js'

export class SignupDto {
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email!: string

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  password!: string

  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'firstName must not be blank' })
  firstName!: string

  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'lastName must not be blank' })
  lastName!: string
}
