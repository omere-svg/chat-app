import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { isDuplicateKeyError } from '../shared/database/mongo-errors.js'
import { KNOWLEDGE_DOCUMENT_REPOSITORY } from './repository/knowledge-document-repository.port.js'
import { KNOWLEDGE_CHUNK_REPOSITORY } from './repository/knowledge-chunk-repository.port.js'
import { EMBEDDINGS_PROVIDER } from './ingestion/embeddings.port.js'
import { TextChunker } from './ingestion/text-chunker.js'
import { hashContent } from './ingestion/content-hash.js'
import { toKnowledgeDocumentView } from './knowledge-document-view.js'
import type { KnowledgeDocumentRepository } from './repository/knowledge-document-repository.port.js'
import type { KnowledgeChunkRepository } from './repository/knowledge-chunk-repository.port.js'
import type { EmbeddingsProvider } from './ingestion/embeddings.port.js'
import type { UploadedFile } from './ingestion/supported-formats.js'
import type { KnowledgeChunkRecord } from './knowledge-chunk.entity.js'
import type { KnowledgeDocumentRecord } from './knowledge-document.entity.js'
import type { KnowledgeDocumentView } from './knowledge-document-view.js'

@Injectable()
export class KnowledgeService {
  constructor(
    @Inject(KNOWLEDGE_DOCUMENT_REPOSITORY)
    private readonly documentRepository: KnowledgeDocumentRepository,
    @Inject(KNOWLEDGE_CHUNK_REPOSITORY)
    private readonly chunkRepository: KnowledgeChunkRepository,
    @Inject(EMBEDDINGS_PROVIDER)
    private readonly embeddings: EmbeddingsProvider,
    private readonly textChunker: TextChunker,
  ) {}

  // Ingests an uploaded text/markdown file into the user's knowledge base: dedup by
  // content, chunk, embed, store. Synchronous — the returned document is already
  // queryable. Re-uploading identical content is an idempotent no-op.
  //
  // Failure handling: chunking and embedding run before any write, so a provider
  // failure persists nothing. Chunks are written first and the document record last as
  // the commit marker; if the document write fails or loses the dedup race, the chunks
  // just written are deleted so no orphans remain.
  async ingestDocument(userId: string, file: UploadedFile): Promise<KnowledgeDocumentView> {
    const text = file.buffer.toString('utf8')
    if (text.trim().length === 0) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'The uploaded document is empty',
      })
    }

    const contentHash = hashContent(file.buffer)

    // Cheap pre-write dedup: the common re-upload returns here without re-embedding.
    const existing = await this.documentRepository.findByContentHashForUser(userId, contentHash)
    if (existing !== null) {
      return toKnowledgeDocumentView(existing)
    }

    const chunkTexts = await this.textChunker.chunk(text)
    if (chunkTexts.length === 0) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'The uploaded document has no extractable text',
      })
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
      await this.chunkRepository.insertMany(chunks)
      inserted = await this.documentRepository.insert(documentRecord)
    } catch (error) {
      // Repair: drop any chunks written for this attempt so a failed or lost ingestion
      // leaves no orphan chunks behind.
      await this.chunkRepository.deleteByDocumentForUser(userId, documentId)

      if (isDuplicateKeyError(error)) {
        // A concurrent identical upload won the (userId, contentHash) race; return it.
        const winner = await this.documentRepository.findByContentHashForUser(userId, contentHash)
        if (winner !== null) {
          return toKnowledgeDocumentView(winner)
        }
      }
      throw error
    }

    return toKnowledgeDocumentView(inserted)
  }

  listDocuments(userId: string): Promise<KnowledgeDocumentView[]> {
    return this.documentRepository
      .listByUserNewestFirst(userId)
      .then((documents) => documents.map(toKnowledgeDocumentView))
  }

  // Removes a document and its chunks. Chunks are deleted first so a deleted document
  // can never leave retrievable content behind. Throws 404 when the document does not
  // exist or is not owned by this user.
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await this.documentRepository.findByIdForUser(userId, documentId)
    if (document === null) {
      throw new NotFoundException({
        code: ERROR_CODES.KNOWLEDGE_DOCUMENT_NOT_FOUND,
        message: 'Document not found',
      })
    }

    await this.chunkRepository.deleteByDocumentForUser(userId, documentId)
    await this.documentRepository.deleteByIdForUser(userId, documentId)
  }
}
