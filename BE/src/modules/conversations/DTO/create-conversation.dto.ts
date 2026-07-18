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
} from '../../../shared/validation/field-constraints.constant.js'

const MAX_TITLE_LENGTH = 120

const CREATABLE_CONVERSATION_TYPES = ['direct', 'assistant', 'tutor'] as const
type CreatableConversationType = (typeof CREATABLE_CONVERSATION_TYPES)[number]

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
  @MaxLength(MAX_TITLE_LENGTH)
  @Matches(NON_WHITESPACE_PATTERN, { message: 'title must not be blank' })
  title?: string
}
