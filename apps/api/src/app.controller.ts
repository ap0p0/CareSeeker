import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from './auth/supabase-jwt.guard';
import type { AuthRequest } from './auth/auth-types';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(private readonly usersService: UsersService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  async me(@Req() req: AuthRequest) {
    const user = req.user;
    const dbUser = await this.usersService.findOrCreateFromJwt(user);

    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    };
  }
}
