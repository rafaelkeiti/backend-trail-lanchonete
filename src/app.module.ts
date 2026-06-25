import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstoqueModule } from './modules/estoque/estoque.module';
import { FidelidadeModule } from './modules/fidelidade/fidelidade.module';
import { AuthModule } from './modules/auth/auth.module';
import { PagamentosModule } from './modules/pagamentos/pagamentos.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { ProdutosModule } from './modules/produtos/produtos.module';
import { UnidadesModule } from './modules/unidades/unidades.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    UnidadesModule,
    ProdutosModule,
    EstoqueModule,
    PedidosModule,
    PagamentosModule,
    FidelidadeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
