import { createHash } from 'node:crypto'

// Stable content fingerprint used as the dedup identity of an uploaded document. Two
// uploads with identical bytes hash equal, so a re-upload collapses onto the existing
// document instead of producing a second copy.
export function hashContent(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex')
}
