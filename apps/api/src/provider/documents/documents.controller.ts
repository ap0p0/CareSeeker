import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import type { UploadedFile as UploadedDocumentFile } from '../common/uploaded-file';
import {
  DOCUMENT_FIELD,
  documentUploadOptions,
  MAX_FILES_PER_UPLOAD,
} from './document-files';
import { parseDisposition, sendDocument } from './document-response';
import { ProviderDocumentsService } from './documents.service';

/**
 * Provider documents (onboarding step 3). Every operation is scoped to the
 * authenticated provider — a document id from another provider is a 404.
 */
@Controller('provider/documents')
@UseGuards(SupabaseJwtGuard)
export class ProviderDocumentsController {
  constructor(private readonly documentsService: ProviderDocumentsService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.documentsService.list(requireProviderUserId(req));
  }

  /** `multipart/form-data`: `category` + one or more `files`. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor(
      DOCUMENT_FIELD,
      MAX_FILES_PER_UPLOAD,
      documentUploadOptions,
    ),
  )
  upload(
    @Req() req: AuthRequest,
    @Body() body: { category?: unknown },
    @UploadedFiles() files?: UploadedDocumentFile[],
  ) {
    return this.documentsService.upload(
      requireProviderUserId(req),
      body?.category,
      files,
    );
  }

  /** Streams the file; `?disposition=inline` lets PDFs / images open in the browser. */
  @Get(':documentId/download')
  async download(
    @Req() req: AuthRequest,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Query('disposition') disposition: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const download = await this.documentsService.download(
      requireProviderUserId(req),
      documentId,
    );
    return sendDocument(res, download, parseDisposition(disposition));
  }

  /** `multipart/form-data`: `file` (+ optional `category`). Keeps the document id. */
  @Put(':documentId')
  @UseInterceptors(FileInterceptor('file', documentUploadOptions))
  replace(
    @Req() req: AuthRequest,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Body() body: { category?: unknown },
    @UploadedFile() file?: UploadedDocumentFile,
  ) {
    return this.documentsService.replace(
      requireProviderUserId(req),
      documentId,
      body?.category,
      file,
    );
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: AuthRequest,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
  ) {
    await this.documentsService.softDelete(
      requireProviderUserId(req),
      documentId,
    );
  }
}
