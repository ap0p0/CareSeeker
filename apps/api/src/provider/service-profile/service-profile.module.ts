import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderServiceProfileController } from './service-profile.controller';
import { ProviderServiceProfileRepository } from './service-profile.repository';
import { ProviderServiceProfileService } from './service-profile.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderServiceProfileController],
  providers: [
    ProviderServiceProfileService,
    ProviderServiceProfileRepository,
    ProviderRepository,
  ],
  exports: [ProviderServiceProfileService],
})
export class ProviderServiceProfileModule {}
