// Client-side upload limits, mirrored from the backend so an invalid file is rejected
// before a wasted round trip. Kept in their own module so both the panel component and
// its container can import them without tripping fast-refresh's component-only rule.
export const ACCEPTED_UPLOAD_EXTENSIONS = ['.txt', '.md', '.markdown'] as const
export const MAX_UPLOAD_BYTES = 1_000_000

export function hasAcceptedExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ACCEPTED_UPLOAD_EXTENSIONS.some((extension) => lower.endsWith(extension))
}
