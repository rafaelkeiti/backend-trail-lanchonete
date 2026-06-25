import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EstoqueController } from './estoque.controller';
import { EstoqueService } from './estoque.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [EstoqueController],
  providers: [EstoqueService],
  exports: [EstoqueService],
})
export class EstoqueModule {}
