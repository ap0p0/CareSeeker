import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { SavedProvidersController } from './saved-providers.controller';
import { SavedProvidersRepository } from './saved-providers.repository';
import { SavedProvidersService } from './saved-providers.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [SavedProvidersController],
  providers: [SavedProvidersService, SavedProvidersRepository],
  exports: [SavedProvidersService, SavedProvidersRepository],
})
export class SavedProvidersModule {}