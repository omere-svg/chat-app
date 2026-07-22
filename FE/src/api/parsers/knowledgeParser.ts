import { MalformedResponseError } from '../malformedResponseError.ts'
import { isRecord, readNumber, readString } from './primitives.ts'
import type {
  KnowledgeDocument,
  KnowledgeDocumentsResponse,
  UploadKnowledgeDocumentResponse,
} from '../../types/api.ts'

function parseKnowledgeDocument(value: unknown): KnowledgeDocument {
  if (!isRecord(value)) {
    throw new MalformedResponseError('knowledgeDocument')
  }
  const status = readString(value, 'status', 'knowledgeDocument')
  if (status !== 'ready' && status !== 'failed') {
    throw new MalformedResponseError('knowledgeDocument.status')
  }
  return {
    id: readString(value, 'id', 'knowledgeDocument'),
    filename: readString(value, 'filename', 'knowledgeDocument'),
    status,
    chunkCount: readNumber(value, 'chunkCount', 'knowledgeDocument'),
    byteSize: readNumber(value, 'byteSize', 'knowledgeDocument'),
    createdAt: readString(value, 'createdAt', 'knowledgeDocument'),
  }
}

export function parseKnowledgeDocumentsResponse(value: unknown): KnowledgeDocumentsResponse {
  if (!isRecord(value) || !Array.isArray(value.documents)) {
    throw new MalformedResponseError('knowledgeDocumentsResponse.documents')
  }
  return { documents: value.documents.map(parseKnowledgeDocument) }
}

export function parseUploadKnowledgeDocumentResponse(
  value: unknown,
): UploadKnowledgeDocumentResponse {
  if (!isRecord(value)) {
    throw new MalformedResponseError('uploadKnowledgeDocumentResponse')
  }
  return { document: parseKnowledgeDocument(value.document) }
}
