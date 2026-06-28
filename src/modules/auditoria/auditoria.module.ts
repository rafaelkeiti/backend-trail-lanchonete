import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
})
export class AuditoriaModule {}
