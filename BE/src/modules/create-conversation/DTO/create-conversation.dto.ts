import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator'
import {
  MAX_EMAIL_LENGTH,
  NON_WHITESPACE_PATTERN,
} from '../../../shared/validation/field-constraints.constants.js'
import {
  CREATABLE_CONVERSATION_TYPES,
  MAX_CONVERSATION_TITLE_LENGTH,
} from '../../conversations/constants.js'
import type { CreatableConversationType } from '../../conversations/types/creatable-conversation-type.js'

export class CreateConversationDto {
  @IsOptional()
  @IsIn(CREATABLE_CONVERSATION_TYPES)
  type?: CreatableConversationType

  @ValidateIf((dto: CreateConversationDto) => dto.type !== 'assistant' && dto.type !== 'tutor')
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  @MaxLength(MAX_EMAIL_LENGTH, { each: true })
  participantEmails!: string[]

  @IsOptional()
  @IsString()
  @MaxLength(MAX_CONVERSATION_TITLE_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'title must not be blank' })
  title?: string
}
