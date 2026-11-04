import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { StorageModule } from '../../storage/storage.module';
import { ProviderProfileImageStorageService } from '../common/profile-image-storage.service';
import { ProviderRepository } from '../provider.repository';
import { ProviderProfileController } from './profile.controller';
import { ProviderProfileRepository } from './profile.repository';
import { ProviderProfileService } from './profile.service';

@Module({
  imports: [AuthModule, UsersModule, StorageModule],
  controllers: [ProviderProfileController],
  providers: [
    ProviderProfileService,
    ProviderProfileRepository,
    ProviderRepository,
    ProviderProfileImageStorageService,
  ],
  exports: [ProviderProfileService],
})
export class ProviderProfileModule {}
