import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FidelidadeController } from './fidelidade.controller';
import { FidelidadeService } from './fidelidade.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [FidelidadeController],
  providers: [FidelidadeService],
})
export class FidelidadeModule {}
