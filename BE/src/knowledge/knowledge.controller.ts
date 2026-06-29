import {
  BadRequestException,
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
import { CurrentUser } from '../auth/decorator/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js'
import { ERROR_CODES } from '../shared/errors/error-codes.constant.js'
import { KnowledgeService } from './knowledge.service.js'
import {
  isSupportedUpload,
  MAX_UPLOAD_BYTES,
  SUPPORTED_EXTENSIONS,
  UPLOAD_BUFFER_LIMIT_BYTES,
} from './ingestion/supported-formats.js'
import type { UploadedFile as UploadedKnowledgeFile } from './ingestion/supported-formats.js'
import type { KnowledgeDocumentView } from './knowledge-document-view.js'
import type { PublicUser } from '../users/user-public-view.js'

interface KnowledgeDocumentResponse {
  document: KnowledgeDocumentView
}

interface KnowledgeDocumentListResponse {
  documents: KnowledgeDocumentView[]
}

@Controller('knowledge/documents')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // memoryStorage; the multer limit is a high memory backstop (UPLOAD_BUFFER_LIMIT_BYTES)
  // so the handler's own MAX_UPLOAD_BYTES check returns the documented structured 400
  // rather than multer's raw 413. Format/size checks below run on accepted files.
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: UPLOAD_BUFFER_LIMIT_BYTES } }))
  async uploadDocument(
    @CurrentUser() currentUser: PublicUser,
    @UploadedFile() file: UploadedKnowledgeFile | undefined,
  ): Promise<KnowledgeDocumentResponse> {
    if (file === undefined) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'No file was uploaded under field "file"',
      })
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `File exceeds the ${MAX_UPLOAD_BYTES}-byte limit`,
      })
    }
    if (!isSupportedUpload(file)) {
      throw new BadRequestException({
        code: ERROR_CODES.UNSUPPORTED_DOCUMENT,
        message: `Only ${SUPPORTED_EXTENSIONS.join(', ')} files are supported`,
      })
    }

    const document = await this.knowledgeService.ingestDocument(currentUser.id, file)
    return { document }
  }

  @Get()
  async listDocuments(
    @CurrentUser() currentUser: PublicUser,
  ): Promise<KnowledgeDocumentListResponse> {
    const documents = await this.knowledgeService.listDocuments(currentUser.id)
    return { documents }
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(
    @CurrentUser() currentUser: PublicUser,
    @Param('documentId') documentId: string,
  ): Promise<void> {
    await this.knowledgeService.deleteDocument(currentUser.id, documentId)
  }
}
