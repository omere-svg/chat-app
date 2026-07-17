export const ACCEPTED_UPLOAD_EXTENSIONS = ['.txt', '.md', '.markdown'] as const
export const MAX_UPLOAD_BYTES = 1_000_000

export function hasAcceptedExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ACCEPTED_UPLOAD_EXTENSIONS.some((extension) => lower.endsWith(extension))
}
