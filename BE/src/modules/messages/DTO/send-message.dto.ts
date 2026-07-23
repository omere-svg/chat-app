import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { NON_WHITESPACE_PATTERN } from '../../../shared/validation/field-constraints.constants.js'
import { MAX_CLIENT_MESSAGE_ID_LENGTH, MAX_MESSAGE_BODY_LENGTH } from '../constants.js'

export class SendMessageDto {
  @IsString()
  @MaxLength(MAX_MESSAGE_BODY_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'body must not be blank' })
  body!: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CLIENT_MESSAGE_ID_LENGTH)
  clientMessageId?: string
}
