import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { RegistrantController } from './registrant.controller';
import { RegistrantRepository } from './registrant.repository';
import { RegistrantService } from './registrant.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [RegistrantController],
  providers: [RegistrantService, RegistrantRepository],
  exports: [RegistrantService, RegistrantRepository],
})
export class RegistrantModule {}
