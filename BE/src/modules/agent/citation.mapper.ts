import type { MessageCitation } from '../../modules/messages/types/message.entity.js'
import type { RetrievedChunk } from '../../modules/knowledge-chunk/types/knowledge-chunk.entity.js'

export function toCitation(chunk: RetrievedChunk): MessageCitation {
  return {
    chunkId: chunk.id,
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    text: chunk.text,
    score: chunk.score,
  }
}
