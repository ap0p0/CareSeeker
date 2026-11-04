import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderWorkPreferencesController } from './work-preferences.controller';
import { ProviderWorkPreferencesRepository } from './work-preferences.repository';
import { ProviderWorkPreferencesService } from './work-preferences.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderWorkPreferencesController],
  providers: [
    ProviderWorkPreferencesService,
    ProviderWorkPreferencesRepository,
    ProviderRepository,
  ],
  exports: [ProviderWorkPreferencesService],
})
export class ProviderWorkPreferencesModule {}
