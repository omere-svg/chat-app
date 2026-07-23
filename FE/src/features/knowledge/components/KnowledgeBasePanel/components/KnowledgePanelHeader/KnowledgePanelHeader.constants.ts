import { ACCEPTED_UPLOAD_LABEL } from '@/features/knowledge/constants/knowledge.ts'

export const KNOWLEDGE_PANEL_HEADER_CLASS = {
  header: 'knowledge-panel__header',
  title: 'knowledge-panel__title',
  hint: 'knowledge-panel__hint',
} as const

export const KNOWLEDGE_PANEL_HEADER_TEXT = {
  title: 'Knowledge base',
  hint: `Upload ${ACCEPTED_UPLOAD_LABEL} files. The tutor answers only from these documents.`,
} as const
