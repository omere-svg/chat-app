import type { UploadedFile } from '../types/uploaded-file.js'

export const MAX_UPLOAD_BYTES = 1_000_000

export const UPLOAD_BUFFER_LIMIT_BYTES = MAX_UPLOAD_BYTES * 5

export const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.markdown'] as const

const SUPPORTED_MIME_TYPES = ['text/plain', 'text/markdown', 'text/x-markdown'] as const

export function hasSupportedExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return SUPPORTED_EXTENSIONS.some((extension) => lower.endsWith(extension))
}

export function hasSupportedMimeType(mimetype: string): boolean {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimetype)
}

export function isSupportedUpload(file: UploadedFile): boolean {
  return hasSupportedExtension(file.originalname) || hasSupportedMimeType(file.mimetype)
}
