import { ACCEPTED_UPLOAD_EXTENSIONS } from '../constants/knowledge.ts'

export function hasAcceptedExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ACCEPTED_UPLOAD_EXTENSIONS.some((extension) => lower.endsWith(extension))
}
