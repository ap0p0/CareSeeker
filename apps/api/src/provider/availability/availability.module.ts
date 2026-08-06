import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderAvailabilityController } from './availability.controller';
import { ProviderAvailabilityRepository } from './availability.repository';
import { ProviderAvailabilityService } from './availability.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderAvailabilityController],
  providers: [
    ProviderAvailabilityService,
    ProviderAvailabilityRepository,
    ProviderRepository,
  ],
})
export class ProviderAvailabilityModule {}
