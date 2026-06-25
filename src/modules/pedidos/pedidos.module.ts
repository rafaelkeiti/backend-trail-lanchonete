import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
