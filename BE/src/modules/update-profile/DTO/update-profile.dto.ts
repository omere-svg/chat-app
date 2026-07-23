import { IsString, Matches, MaxLength } from 'class-validator'
import {
  MAX_NAME_LENGTH,
  NON_WHITESPACE_PATTERN,
} from '../../../shared/validation/field-constraints.constants.js'

export class UpdateProfileDto {
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'firstName must not be blank' })
  firstName!: string

  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'lastName must not be blank' })
  lastName!: string
}
