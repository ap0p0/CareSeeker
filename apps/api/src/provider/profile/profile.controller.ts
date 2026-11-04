import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireProviderUserId } from '../common/provider-auth';
import {
  PROFILE_IMAGE_FIELD,
  profileImageUploadOptions,
  type UploadedFile as UploadedProfileImage,
} from '../common/uploaded-file';
import { ProviderProfileService } from './profile.service';

@Controller('provider/profile')
@UseGuards(SupabaseJwtGuard)
export class ProviderProfileController {
  constructor(private readonly profileService: ProviderProfileService) {}

  @Get()
  getProfile(@Req() req: AuthRequest) {
    const userId = requireProviderUserId(req);
    return this.profileService.getProfile(userId);
  }

  /** Partial update of identity + personal information (JSON body). */
  @Patch()
  updateProfile(@Req() req: AuthRequest, @Body() body: unknown) {
    const userId = requireProviderUserId(req);
    return this.profileService.updateProfile(userId, body);
  }

  /** Replaces the profile picture (`multipart/form-data`, field `profilePicture`). */
  @Put('picture')
  @UseInterceptors(
    FileInterceptor(PROFILE_IMAGE_FIELD, profileImageUploadOptions),
  )
  updateProfilePicture(
    @Req() req: AuthRequest,
    @UploadedFile() profilePicture?: UploadedProfileImage,
  ) {
    const userId = requireProviderUserId(req);
    return this.profileService.updateProfilePicture(userId, profilePicture);
  }
}
