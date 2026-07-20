import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CurrentUser } from '../auth/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { UploadDocumentOrchestrator } from '../upload-document/upload-document.orchestrator.js'
import { ListDocumentsOrchestrator } from '../list-documents/list-documents.orchestrator.js'
import { DeleteDocumentOrchestrator } from '../delete-document/delete-document.orchestrator.js'
import { UPLOAD_BUFFER_LIMIT_BYTES } from '../knowledge-rag/ingestion/supported-formats.js'
import type { UploadedFile as UploadedKnowledgeFile } from '../knowledge-rag/types/uploaded-file.js'
import type {
  KnowledgeDocumentListResponse,
  KnowledgeDocumentResponse,
} from './types/knowledge-document-responses.js'
import type { User } from '../users/types/user.js'

@Controller('knowledge/documents')
@UseGuards(JwtAuthGuard)
export class KnowledgeDocumentsController {
  constructor(
    private readonly uploadDocumentOrchestrator: UploadDocumentOrchestrator,
    private readonly listDocumentsOrchestrator: ListDocumentsOrchestrator,
    private readonly deleteDocumentOrchestrator: DeleteDocumentOrchestrator,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: UPLOAD_BUFFER_LIMIT_BYTES } }))
  async uploadDocument(
    @CurrentUser() currentUser: User,
    @UploadedFile() file: UploadedKnowledgeFile | undefined,
  ): Promise<KnowledgeDocumentResponse> {
    const document = await this.uploadDocumentOrchestrator.upload(currentUser.id, file)
    return { document }
  }

  @Get()
  async listDocuments(
    @CurrentUser() currentUser: User,
  ): Promise<KnowledgeDocumentListResponse> {
    const documents = await this.listDocumentsOrchestrator.list(currentUser.id)
    return { documents }
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(
    @CurrentUser() currentUser: User,
    @Param('documentId') documentId: string,
  ): Promise<void> {
    await this.deleteDocumentOrchestrator.delete(currentUser.id, documentId)
  }
}
