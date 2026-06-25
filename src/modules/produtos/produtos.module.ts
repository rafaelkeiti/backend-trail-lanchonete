import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ProdutosController],
  providers: [ProdutosService],
  exports: [ProdutosService],
})
export class ProdutosModule {}
