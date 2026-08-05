import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderAccountSettingsController } from './account-settings.controller';
import { ProviderAccountSettingsRepository } from './account-settings.repository';
import { ProviderAccountSettingsService } from './account-settings.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderAccountSettingsController],
  providers: [
    ProviderAccountSettingsService,
    ProviderAccountSettingsRepository,
    ProviderRepository,
  ],
})
export class ProviderAccountSettingsModule {}
