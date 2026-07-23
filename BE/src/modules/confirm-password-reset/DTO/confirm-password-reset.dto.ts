import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator'
import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../../shared/validation/field-constraints.constant.js'
import { OTP_CODE_LENGTH } from '../../password-reset-otp/constants.js'
import { NUMERIC_CODE_PATTERN } from '../constants.js'

export class ConfirmPasswordResetDto {
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email!: string

  @IsString()
  @Length(OTP_CODE_LENGTH, OTP_CODE_LENGTH)
  @Matches(NUMERIC_CODE_PATTERN)
  code!: string

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  newPassword!: string
}
