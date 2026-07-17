import type { KnowledgeDocument } from '@/types/api.ts'
import { KNOWLEDGE_DOCUMENT_META_TEXT } from './KnowledgeDocumentList.constants.ts'

function formatBytes(byteSize: number): string {
  if (byteSize < 1024) {
    return `${byteSize.toString()} B`
  }
  return `${(byteSize / 1024).toFixed(1)} KB`
}

export function documentMetaLabel(document: KnowledgeDocument): string {
  return document.status === 'ready'
    ? `${document.chunkCount.toString()} chunks · ${formatBytes(document.byteSize)}`
    : KNOWLEDGE_DOCUMENT_META_TEXT.failed
}
