import { IsEmail, MaxLength } from 'class-validator'
import { MAX_EMAIL_LENGTH } from '../../../shared/validation/field-constraints.constant.js'

export class RequestPasswordResetDto {
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  email!: string
}
