import { Logger, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { getAuthMode, getLocalDataDir, isLocalAuthMode } from './auth-mode';
import { AUTH_USER_PROVIDER } from './auth-user-provider';
import { LocalAuthController } from './local/local-auth.controller';
import { LocalAuthUserProvider } from './local/local-auth-user-provider';
import { SupabaseAuthUserProvider } from './supabase-auth-user-provider';
import { SupabaseJwtGuard } from './supabase-jwt.guard';

const logger = new Logger('AuthModule');

@Module({
  imports: [UsersModule],
  // The local sign-in endpoint only exists when AUTH_MODE=local.
  controllers: isLocalAuthMode() ? [LocalAuthController] : [],
  providers: [
    SupabaseJwtGuard,
    {
      provide: AUTH_USER_PROVIDER,
      useFactory: () => {
        if (getAuthMode() === 'local') {
          logger.warn(
            `AUTH_MODE=local — offline auth shim active (credentials in ${getLocalDataDir()}). Do not use in production.`,
          );
          return new LocalAuthUserProvider();
        }

        return new SupabaseAuthUserProvider();
      },
    },
  ],
  exports: [SupabaseJwtGuard, UsersModule, AUTH_USER_PROVIDER],
})
export class AuthModule {}
