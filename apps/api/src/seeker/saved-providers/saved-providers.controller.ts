import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { SavedProvidersService } from './saved-providers.service';

@Controller('seeker/saved-providers')
@UseGuards(SupabaseJwtGuard)
export class SavedProvidersController {
  constructor(
    private readonly savedProvidersService: SavedProvidersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async saveProvider(
    @Req() req: AuthRequest,
    @Body() body: { providerId?: string },
  ) {
    const seekerId = requireSeekerUser(req);
    const savedProvider = await this.savedProvidersService.saveProvider(
      seekerId,
      body.providerId ?? '',
    );

    return {
      success: true,
      message: 'Provider saved successfully',
      data: savedProvider,
    };
  }

  @Delete(':providerId')
  async removeSavedProvider(
    @Req() req: AuthRequest,
    @Param('providerId') providerId: string,
  ) {
    const seekerId = requireSeekerUser(req);
    await this.savedProvidersService.removeSavedProvider(seekerId, providerId);

    return {
      success: true,
      message: 'Saved provider removed successfully',
    };
  }

  @Get()
  async listSavedProviders(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.savedProvidersService.listSavedProviders(seekerId);
  }
}