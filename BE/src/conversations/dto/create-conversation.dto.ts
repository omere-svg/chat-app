import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'
import {
  MAX_EMAIL_LENGTH,
  NON_WHITESPACE_PATTERN,
} from '../../shared/validation/field-constraints.constant.js'

const MAX_TITLE_LENGTH = 120

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  @MaxLength(MAX_EMAIL_LENGTH, { each: true })
  participantEmails!: string[]

  @IsOptional()
  @IsString()
  @MaxLength(MAX_TITLE_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'title must not be blank' })
  title?: string
}
