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
} from '../../shared/validation/field-constraints.constant.js'

const MAX_TITLE_LENGTH = 120

// The client-creatable conversation kinds. Both 'assistant' and 'tutor' are private
// single-user AI chats; 'direct' is human-to-human.
const CREATABLE_CONVERSATION_TYPES = ['direct', 'assistant', 'tutor'] as const
type CreatableConversationType = (typeof CREATABLE_CONVERSATION_TYPES)[number]

export class CreateConversationDto {
  @IsOptional()
  @IsIn(CREATABLE_CONVERSATION_TYPES)
  type?: CreatableConversationType

  // Required only for 'direct' conversations. Assistant and tutor conversations have
  // the creator as their sole participant, so they carry no invitee emails.
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
