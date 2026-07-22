import type { ConversationType } from './types/conversation.entity.js'

export const DEFAULT_CONVERSATION_TYPE: ConversationType = 'direct'

export const DEFAULT_ASSISTANT_CONVERSATION_TITLE = 'AI Assistant'

export const DEFAULT_TUTOR_CONVERSATION_TITLE = 'AI Tutor'

export const MAX_DERIVED_TITLE_LENGTH = 60

export const MAX_CONVERSATION_TITLE_LENGTH = 120

export const CREATABLE_CONVERSATION_TYPES = ['direct', 'assistant', 'tutor'] as const
