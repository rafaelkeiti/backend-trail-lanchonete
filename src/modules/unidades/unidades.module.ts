import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UnidadesController } from './unidades.controller';
import { UnidadesService } from './unidades.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UnidadesController],
  providers: [UnidadesService],
  exports: [UnidadesService],
})
export class UnidadesModule {}
