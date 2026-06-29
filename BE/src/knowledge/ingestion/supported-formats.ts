// Upload policy for the knowledge base. We support plain text and Markdown only: both
// are decoded as UTF-8 and chunked directly, with no binary parsing. Documented in the
// API contract and enforced at the upload boundary.

// 1 MB. Generous for text/markdown notes while bounding per-request embedding cost and
// memory. Oversized uploads are rejected (by the controller) before any work is done.
export const MAX_UPLOAD_BYTES = 1_000_000

// Hard cap on bytes the multipart parser buffers in memory — a backstop set ABOVE the
// user-facing limit so the controller's own size check yields the documented structured
// 400 (VALIDATION_ERROR) instead of multer's raw 413. Bodies beyond this cap are refused
// outright by the parser as abuse protection.
export const UPLOAD_BUFFER_LIMIT_BYTES = MAX_UPLOAD_BYTES * 5

export const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.markdown'] as const

// Browsers are inconsistent about Markdown's MIME type (text/markdown, text/plain, or
// empty), so the extension is the authoritative check; these are accepted when present.
const SUPPORTED_MIME_TYPES = ['text/plain', 'text/markdown', 'text/x-markdown'] as const

// The subset of a Multer file this module reads. Declared locally so the knowledge
// module does not depend on ambient Multer global types.
export interface UploadedFile {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

export function hasSupportedExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return SUPPORTED_EXTENSIONS.some((extension) => lower.endsWith(extension))
}

export function hasSupportedMimeType(mimetype: string): boolean {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimetype)
}

// A file is accepted when its extension is supported. The MIME type is allowed to be
// unset/odd (Markdown), but a recognized text MIME type alone also qualifies.
export function isSupportedUpload(file: UploadedFile): boolean {
  return hasSupportedExtension(file.originalname) || hasSupportedMimeType(file.mimetype)
}
