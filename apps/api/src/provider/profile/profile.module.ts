import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderProfileController } from './profile.controller';
import { ProviderProfileRepository } from './profile.repository';
import { ProviderProfileService } from './profile.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderProfileController],
  providers: [
    ProviderProfileService,
    ProviderProfileRepository,
    ProviderRepository,
  ],
})
export class ProviderProfileModule {}
