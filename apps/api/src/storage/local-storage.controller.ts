import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FILE_STORAGE, type FileStorage } from './file-storage';
import { LocalFileStorage } from './local-file-storage';

/**
 * Serves objects for `AUTH_MODE=local` signed URLs. Only registered in that
 * mode; the signature/expiry check lives in `LocalFileStorage.read`.
 */
@Controller('local-storage')
export class LocalStorageController {
  constructor(@Inject(FILE_STORAGE) private readonly storage: FileStorage) {}

  @Get('file')
  async file(
    @Query('bucket') bucket: string | undefined,
    @Query('path') path: string | undefined,
    @Query('expires') expires: string | undefined,
    @Query('signature') signature: string | undefined,
    @Res() res: Response,
  ) {
    const file =
      this.storage instanceof LocalFileStorage && bucket && path && signature
        ? await this.storage.readSigned(
            bucket,
            path,
            Number(expires),
            signature,
          )
        : null;

    if (!file) {
      throw new NotFoundException('File not found');
    }

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(file.buffer);
  }
}
