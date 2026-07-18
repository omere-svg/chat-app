import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { isDuplicateKeyError } from '../../shared/database/mongo-errors.js'
import { KnowledgeDocumentService } from '../knowledge-document/knowledge-document.service.js'
import { KnowledgeChunkService } from '../knowledge-chunk/knowledge-chunk.service.js'
import { EMBEDDINGS_PROVIDER } from '../embeddings/embeddings.tokens.js'
import { TextChunker } from '../knowledge-rag/ingestion/text-chunker.js'
import { hashContent } from '../knowledge-rag/ingestion/content-hash.js'
import {
  isSupportedUpload,
  MAX_UPLOAD_BYTES,
} from '../knowledge-rag/ingestion/supported-formats.js'
import { toKnowledgeDocumentView } from '../knowledge-document/knowledge-document.mapper.js'
import { MissingUploadFileError } from './errors/missing-upload-file.error.js'
import { FileTooLargeError } from './errors/file-too-large.error.js'
import { UnsupportedDocumentError } from './errors/unsupported-document.error.js'
import { EmptyDocumentError } from './errors/empty-document.error.js'
import { NoExtractableTextError } from './errors/no-extractable-text.error.js'
import type { EmbeddingsProvider } from '../embeddings/types/embeddings-provider.js'
import type { UploadedFile } from '../knowledge-rag/types/uploaded-file.js'
import type { KnowledgeChunkRecord } from '../knowledge-chunk/types/knowledge-chunk.entity.js'
import type { KnowledgeDocumentRecord } from '../knowledge-document/types/knowledge-document.entity.js'
import type { KnowledgeDocumentView } from '../knowledge-document/types/knowledge-document-view.js'

@Injectable()
export class UploadDocumentOrchestrator {
  constructor(
    private readonly documentService: KnowledgeDocumentService,
    private readonly chunkService: KnowledgeChunkService,
    @Inject(EMBEDDINGS_PROVIDER) private readonly embeddings: EmbeddingsProvider,
    private readonly textChunker: TextChunker,
  ) {}

  async upload(userId: string, file: UploadedFile | undefined): Promise<KnowledgeDocumentView> {
    if (file === undefined) {
      throw new MissingUploadFileError()
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new FileTooLargeError()
    }
    if (!isSupportedUpload(file)) {
      throw new UnsupportedDocumentError()
    }

    return this.ingestDocument(userId, file)
  }

  private async ingestDocument(
    userId: string,
    file: UploadedFile,
  ): Promise<KnowledgeDocumentView> {
    const text = file.buffer.toString('utf8')
    if (text.trim().length === 0) {
      throw new EmptyDocumentError()
    }

    const contentHash = hashContent(file.buffer)

    const existing = await this.documentService.findByContentHashForUser(userId, contentHash)
    if (existing !== null) {
      return toKnowledgeDocumentView(existing)
    }

    const chunkTexts = await this.textChunker.chunk(text)
    if (chunkTexts.length === 0) {
      throw new NoExtractableTextError()
    }

    const embeddings = await this.embeddings.embedDocuments(chunkTexts)
    if (embeddings.length !== chunkTexts.length) {
      throw new Error('Embedding provider returned a different number of vectors than chunks')
    }

    const documentId = `kdoc-${randomUUID()}`
    const createdAt = new Date().toISOString()
    const chunks: KnowledgeChunkRecord[] = chunkTexts.map((chunkText, chunkIndex) => ({
      id: `kchunk-${randomUUID()}`,
      userId,
      documentId,
      documentName: file.originalname,
      chunkIndex,
      text: chunkText,
      embedding: embeddings[chunkIndex] ?? [],
    }))

    const documentRecord: KnowledgeDocumentRecord = {
      id: documentId,
      userId,
      filename: file.originalname,
      contentHash,
      byteSize: file.size,
      chunkCount: chunks.length,
      status: 'ready',
      createdAt,
    }

    let inserted: KnowledgeDocumentRecord
    try {
      await this.chunkService.insertMany(chunks)
      inserted = await this.documentService.insert(documentRecord)
    } catch (error) {
      await this.chunkService.deleteByDocumentForUser(userId, documentId)

      if (isDuplicateKeyError(error)) {
        const winner = await this.documentService.findByContentHashForUser(userId, contentHash)
        if (winner !== null) {
          return toKnowledgeDocumentView(winner)
        }
      }
      throw error
    }

    return toKnowledgeDocumentView(inserted)
  }
}
