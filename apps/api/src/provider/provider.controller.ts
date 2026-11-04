import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import type { AuthRequest } from '../auth/auth-types';
import {
  PROFILE_IMAGE_FIELD,
  profileImageUploadOptions,
  type UploadedFile as UploadedProfileImage,
} from './common/uploaded-file';
import { ProviderService } from './provider.service';

/**
 * Provider-only endpoints.
 *
 * `GET /provider/me` is the source of truth for whether the current
 * Supabase-authenticated user may use the provider app.
 */
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  /**
   * Onboarding step 1 — personal information.
   *
   * Expects `multipart/form-data` (text fields + a `profilePicture` image).
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor(PROFILE_IMAGE_FIELD, profileImageUploadOptions),
  )
  async register(
    @Body() body: unknown,
    @UploadedFile() profilePicture?: UploadedProfileImage,
  ) {
    const user = await this.providerService.register(body, profilePicture);

    return {
      success: true,
      message: 'Care provider account created successfully',
      data: user,
    };
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  providerMe(@Req() req: AuthRequest) {
    if (req.user.role !== 'provider') {
      throw new ForbiddenException(
        'You do not have permission to access the provider area.',
      );
    }

    return req.user;
  }
}
