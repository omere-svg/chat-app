import { ACCEPTED_UPLOAD_EXTENSIONS, MAX_UPLOAD_BYTES } from '../utils/uploadLimits.ts'

export const ACCEPTED_UPLOAD_LABEL = ACCEPTED_UPLOAD_EXTENSIONS.join(', ')

export const ACCEPTED_UPLOAD_ACCEPT = ACCEPTED_UPLOAD_EXTENSIONS.join(',')

export const KNOWLEDGE_ERROR = {
  load: 'Could not load your documents.',
  upload: 'Upload failed. Please try again.',
  delete: 'Could not delete the document.',
} as const

export const KNOWLEDGE_MESSAGE = {
  unsupportedExtension: `Only ${ACCEPTED_UPLOAD_LABEL} files are supported.`,
  fileTooLarge: `File is too large (max ${Math.round(MAX_UPLOAD_BYTES / 1000).toString()} KB).`,
} as const
