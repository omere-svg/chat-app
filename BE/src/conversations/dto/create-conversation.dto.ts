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

// Only the client-creatable conversation kinds. 'tutor' is created server-side in a
// later week and is intentionally not accepted here.
const CREATABLE_CONVERSATION_TYPES = ['direct', 'assistant'] as const
type CreatableConversationType = (typeof CREATABLE_CONVERSATION_TYPES)[number]

export class CreateConversationDto {
  @IsOptional()
  @IsIn(CREATABLE_CONVERSATION_TYPES)
  type?: CreatableConversationType

  // Required for 'direct' conversations; an assistant conversation has the creator as
  // its only participant, so it carries no invitee emails.
  @ValidateIf((dto: CreateConversationDto) => dto.type !== 'assistant')
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
