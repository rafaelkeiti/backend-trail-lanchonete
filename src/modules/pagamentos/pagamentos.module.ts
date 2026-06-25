import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [PagamentosController],
  providers: [PagamentosService],
})
export class PagamentosModule {}
