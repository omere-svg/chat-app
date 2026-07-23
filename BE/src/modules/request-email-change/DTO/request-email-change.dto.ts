import { IsEmail, MaxLength } from 'class-validator'
import { MAX_EMAIL_LENGTH } from '../../../shared/validation/field-constraints.constants.js'

export class RequestEmailChangeDto {
  @IsEmail()
  @MaxLength(MAX_EMAIL_LENGTH)
  newEmail!: string
}
