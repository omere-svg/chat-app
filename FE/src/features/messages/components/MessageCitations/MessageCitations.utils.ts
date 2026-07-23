import { CITATION_PREVIEW_LENGTH } from './MessageCitations.constants.ts'

export function formatCitationPreview(text: string): string {
  const collapsed = text.replace(/\s+/g, ' ').trim()
  return collapsed.length > CITATION_PREVIEW_LENGTH
    ? `${collapsed.slice(0, CITATION_PREVIEW_LENGTH)}…`
    : collapsed
}
