import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { NON_WHITESPACE_PATTERN } from '../../../shared/validation/field-constraints.constant.js'

const MAX_MESSAGE_LENGTH = 8000
const MAX_CLIENT_MESSAGE_ID_LENGTH = 200

export class SendMessageDto {
  @IsString()
  @MaxLength(MAX_MESSAGE_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'body must not be blank' })
  body!: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CLIENT_MESSAGE_ID_LENGTH)
  clientMessageId?: string
}
