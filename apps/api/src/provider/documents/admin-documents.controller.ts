import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { requireAdminUserId } from '../../admin/admin-auth';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { parseDisposition, sendDocument } from './document-response';
import { ProviderDocumentsService } from './documents.service';

/**
 * Admin (read-only) view of a provider's documents, e.g. for verification.
 * Same service and storage path as the provider endpoints; only the
 * authorization rule differs (role = admin, provider chosen by path).
 */
@Controller('admin/providers/:providerId/documents')
@UseGuards(SupabaseJwtGuard)
export class AdminProviderDocumentsController {
  constructor(private readonly documentsService: ProviderDocumentsService) {}

  @Get()
  list(
    @Req() req: AuthRequest,
    @Param('providerId', new ParseUUIDPipe()) providerId: string,
  ) {
    requireAdminUserId(req);
    return this.documentsService.list(providerId);
  }

  @Get(':documentId/download')
  async download(
    @Req() req: AuthRequest,
    @Param('providerId', new ParseUUIDPipe()) providerId: string,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Query('disposition') disposition: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    requireAdminUserId(req);
    const download = await this.documentsService.download(
      providerId,
      documentId,
    );
    return sendDocument(res, download, parseDisposition(disposition));
  }
}
