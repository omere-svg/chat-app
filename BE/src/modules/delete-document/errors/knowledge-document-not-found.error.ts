import { HttpStatus } from '@nestjs/common'
import { AppException } from '../../../shared/errors/app.exception.js'
import { ERROR_CODES } from '../../../shared/errors/error-codes.constant.js'

export class KnowledgeDocumentNotFoundError extends AppException {
  constructor() {
    super(HttpStatus.NOT_FOUND, ERROR_CODES.KNOWLEDGE_DOCUMENT_NOT_FOUND, 'Document not found')
  }
}
