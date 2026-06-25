import * as bcrypt from 'bcrypt';
import {
  CanalPedido,
  PerfilUsuario,
  PrismaClient,
  StatusPagamento,
  StatusPedido,
  TipoMovimentacaoEstoque,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.auditoria.deleteMany();
  await prisma.movimentacaoEstoque.deleteMany();
  await prisma.fidelidade.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.pedidoItem.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.estoque.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.unidade.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaHash = await bcrypt.hash('Senha@123', 10);

  const admin = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@lanchonete.com',
      senhaHash,
      perfil: PerfilUsuario.ADMIN,
    },
  });

  const gerente = await prisma.usuario.create({
    data: {
      nome: 'Gerente Centro',
      email: 'gerente@lanchonete.com',
      senhaHash,
      perfil: PerfilUsuario.GERENTE,
    },
  });

  const cliente = await prisma.usuario.create({
    data: {
      nome: 'Cliente Teste',
      email: 'cliente@exemplo.com',
      telefone: '11999990000',
      senhaHash,
      perfil: PerfilUsuario.CLIENTE,
      consentimentoFidelidade: true,
      fidelidade: {
        create: {
          pontos: 20,
        },
      },
    },
  });

  const unidadeCentro = await prisma.unidade.create({
    data: {
      nome: 'Unidade Centro',
      codigo: 'CENTRO',
      endereco: 'Rua Principal, 100',
    },
  });

  const unidadeShopping = await prisma.unidade.create({
    data: {
      nome: 'Unidade Shopping',
      codigo: 'SHOPPING',
      endereco: 'Avenida Comercial, 500',
    },
  });

  const xBurger = await prisma.produto.create({
    data: {
      nome: 'X-Burger',
      descricao: 'Hambúrguer simples com queijo.',
      precoCentavos: 1990,
    },
  });

  const batata = await prisma.produto.create({
    data: {
      nome: 'Batata Frita',
      descricao: 'Porção individual de batata frita.',
      precoCentavos: 1290,
    },
  });

  const refrigerante = await prisma.produto.create({
    data: {
      nome: 'Refrigerante',
      descricao: 'Lata 350ml.',
      precoCentavos: 690,
    },
  });

  const estoques = await Promise.all([
    prisma.estoque.create({
      data: {
        unidadeId: unidadeCentro.id,
        produtoId: xBurger.id,
        quantidade: 30,
        minimo: 5,
      },
    }),
    prisma.estoque.create({
      data: {
        unidadeId: unidadeCentro.id,
        produtoId: batata.id,
        quantidade: 50,
        minimo: 10,
      },
    }),
    prisma.estoque.create({
      data: {
        unidadeId: unidadeCentro.id,
        produtoId: refrigerante.id,
        quantidade: 80,
        minimo: 15,
      },
    }),
    prisma.estoque.create({
      data: {
        unidadeId: unidadeShopping.id,
        produtoId: xBurger.id,
        quantidade: 20,
        minimo: 5,
      },
    }),
  ]);

  await prisma.movimentacaoEstoque.createMany({
    data: estoques.map((estoque) => ({
      estoqueId: estoque.id,
      usuarioId: gerente.id,
      tipo: TipoMovimentacaoEstoque.ENTRADA,
      quantidade: estoque.quantidade,
      motivo: 'Carga inicial do seed',
    })),
  });

  const pedido = await prisma.pedido.create({
    data: {
      codigo: 'PED-0001',
      clienteId: cliente.id,
      unidadeId: unidadeCentro.id,
      canalPedido: CanalPedido.TOTEM,
      status: StatusPedido.PAGO,
      totalCentavos: 3280,
      itens: {
        create: [
          {
            produtoId: xBurger.id,
            quantidade: 1,
            precoUnitarioCentavos: 1990,
            subtotalCentavos: 1990,
          },
          {
            produtoId: batata.id,
            quantidade: 1,
            precoUnitarioCentavos: 1290,
            subtotalCentavos: 1290,
          },
        ],
      },
      pagamento: {
        create: {
          status: StatusPagamento.APROVADO,
          metodo: 'MOCK',
          valorCentavos: 3280,
          providerPayload: JSON.stringify({
            provider: 'mock',
            autorizacao: 'MOCK-APROVADO-0001',
          }),
        },
      },
    },
  });

  await prisma.auditoria.createMany({
    data: [
      {
        usuarioId: admin.id,
        acao: 'SEED_EXECUTADO',
        recurso: 'Sistema',
        detalhes: 'Dados iniciais cadastrados para testes locais.',
      },
      {
        usuarioId: cliente.id,
        acao: 'PEDIDO_CRIADO',
        recurso: 'Pedido',
        recursoId: pedido.id,
        detalhes: 'Pedido de exemplo criado pelo seed.',
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
