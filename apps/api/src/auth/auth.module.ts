import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SupabaseJwtGuard } from './supabase-jwt.guard';

@Module({
  imports: [UsersModule],
  providers: [SupabaseJwtGuard],
  exports: [SupabaseJwtGuard, UsersModule],
})
export class AuthModule {}
