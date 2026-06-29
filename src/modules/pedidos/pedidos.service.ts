import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CanalPedido, Pedido, PerfilUsuario, StatusPedido, TipoMovimentacaoEstoque } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoResponseDto } from './dto/pedido-response.dto';
import { UpdatePedidoStatusDto } from './dto/update-pedido-status.dto';

type PedidoComRelacoes = Pedido & {
  cliente: { nome: string };
  unidade: { nome: string };
  itens: Array<{
    produtoId: string;
    quantidade: number;
    precoUnitarioCentavos: number;
    subtotalCentavos: number;
    produto: { nome: string };
  }>;
};

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePedidoDto, usuario: AuthenticatedUser): Promise<PedidoResponseDto> {
    const unidade = await this.prisma.unidade.findUnique({
      where: { id: dto.unidadeId },
      select: { id: true, ativa: true },
    });

    if (!unidade) {
      throw new NotFoundException('Unidade não encontrada.');
    }

    if (!unidade.ativa) {
      throw new ConflictException('Unidade inativa para receber pedidos.');
    }

    const produtosIds = dto.itens.map((item) => item.produtoId);
    const produtos = await this.prisma.produto.findMany({
      where: {
        id: { in: produtosIds },
        ativo: true,
      },
    });

    if (produtos.length !== new Set(produtosIds).size) {
      throw new NotFoundException('Um ou mais produtos não foram encontrados.');
    }

    const estoques = await this.prisma.estoque.findMany({
      where: {
        unidadeId: dto.unidadeId,
        produtoId: { in: produtosIds },
      },
    });

    const totalCentavos = dto.itens.reduce((total, item) => {
      const produto = produtos.find((produtoAtual) => produtoAtual.id === item.produtoId);
      const estoque = estoques.find((estoqueAtual) => estoqueAtual.produtoId === item.produtoId);

      if (!produto) {
        throw new NotFoundException('Produto não encontrado.');
      }

      if (!estoque || estoque.quantidade < item.quantidade) {
        throw new ConflictException('Estoque insuficiente para um ou mais itens.');
      }

      return total + produto.precoCentavos * item.quantidade;
    }, 0);

    const codigo = await this.gerarCodigoPedido();

    const pedido = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.itens) {
        const estoque = estoques.find((estoqueAtual) => estoqueAtual.produtoId === item.produtoId);

        if (!estoque) {
          throw new ConflictException('Estoque insuficiente para um ou mais itens.');
        }

        await tx.estoque.update({
          where: { id: estoque.id },
          data: {
            quantidade: estoque.quantidade - item.quantidade,
          },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            estoqueId: estoque.id,
            usuarioId: usuario.id,
            tipo: TipoMovimentacaoEstoque.SAIDA,
            quantidade: item.quantidade,
            motivo: `Reserva para pedido ${codigo}`,
          },
        });
      }

      const pedidoCriado = await tx.pedido.create({
        data: {
          codigo,
          clienteId: usuario.id,
          unidadeId: dto.unidadeId,
          canalPedido: dto.canalPedido,
          status: StatusPedido.AGUARDANDO_PAGAMENTO,
          totalCentavos,
          itens: {
            create: dto.itens.map((item) => {
              const produto = produtos.find((produtoAtual) => produtoAtual.id === item.produtoId);

              if (!produto) {
                throw new NotFoundException('Produto não encontrado.');
              }

              return {
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                precoUnitarioCentavos: produto.precoCentavos,
                subtotalCentavos: produto.precoCentavos * item.quantidade,
              };
            }),
          },
        },
        include: this.pedidoInclude(),
      });

      await tx.auditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: 'PEDIDO_CRIADO',
          recurso: 'Pedido',
          recursoId: pedidoCriado.id,
          detalhes: JSON.stringify({
            codigo,
            canalPedido: dto.canalPedido,
            totalCentavos,
          }),
        },
      });

      return pedidoCriado;
    });

    return this.toResponse(pedido);
  }

  async findAll(filters: {
    canalPedido?: CanalPedido;
    status?: StatusPedido;
  }): Promise<PedidoResponseDto[]> {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        canalPedido: filters.canalPedido,
        status: filters.status,
      },
      include: this.pedidoInclude(),
      orderBy: { createdAt: 'desc' },
    });

    return pedidos.map((pedido) => this.toResponse(pedido));
  }

  async findOne(id: string, usuario: AuthenticatedUser): Promise<PedidoResponseDto> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: this.pedidoInclude(),
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (usuario.perfil === PerfilUsuario.CLIENTE && pedido.clienteId !== usuario.id) {
      throw new ForbiddenException('Cliente só pode consultar os próprios pedidos.');
    }

    return this.toResponse(pedido);
  }

  async updateStatus(
    id: string,
    dto: UpdatePedidoStatusDto,
    usuario: AuthenticatedUser,
  ): Promise<PedidoResponseDto> {
    const pedidoAtual = await this.prisma.pedido.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!pedidoAtual) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    this.validarTransicaoStatus(pedidoAtual.status, dto.status);

    const pedido = await this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.pedido.update({
        where: { id },
        data: { status: dto.status },
        include: this.pedidoInclude(),
      });

      await tx.auditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: 'PEDIDO_STATUS_ATUALIZADO',
          recurso: 'Pedido',
          recursoId: id,
          detalhes: JSON.stringify({
            statusAnterior: pedidoAtual.status,
            statusNovo: dto.status,
          }),
        },
      });

      return atualizado;
    });

    return this.toResponse(pedido);
  }

  private validarTransicaoStatus(statusAtual: StatusPedido, novoStatus: StatusPedido): void {
    const transicoesPermitidas: Partial<Record<StatusPedido, StatusPedido[]>> = {
      [StatusPedido.PAGO]: [StatusPedido.EM_PREPARO],
      [StatusPedido.EM_PREPARO]: [StatusPedido.PRONTO],
      [StatusPedido.PRONTO]: [StatusPedido.ENTREGUE],
    };

    if (!transicoesPermitidas[statusAtual]?.includes(novoStatus)) {
      throw new ConflictException(
        `Transição de status inválida: ${statusAtual} para ${novoStatus}.`,
      );
    }
  }

  async cancel(id: string, usuario: AuthenticatedUser): Promise<void> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (usuario.perfil === PerfilUsuario.CLIENTE && pedido.clienteId !== usuario.id) {
      throw new ForbiddenException('Cliente só pode cancelar os próprios pedidos.');
    }

    if (pedido.status === StatusPedido.ENTREGUE || pedido.status === StatusPedido.CANCELADO) {
      throw new ConflictException('Pedido não pode ser cancelado neste status.');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of pedido.itens) {
        const estoque = await tx.estoque.findUnique({
          where: {
            unidadeId_produtoId: {
              unidadeId: pedido.unidadeId,
              produtoId: item.produtoId,
            },
          },
        });

        if (estoque) {
          await tx.estoque.update({
            where: { id: estoque.id },
            data: { quantidade: estoque.quantidade + item.quantidade },
          });

          await tx.movimentacaoEstoque.create({
            data: {
              estoqueId: estoque.id,
              usuarioId: usuario.id,
              tipo: TipoMovimentacaoEstoque.ESTORNO,
              quantidade: item.quantidade,
              motivo: `Cancelamento do pedido ${pedido.codigo}`,
            },
          });
        }
      }

      await tx.pedido.update({
        where: { id },
        data: { status: StatusPedido.CANCELADO },
      });

      await tx.auditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: 'PEDIDO_CANCELADO',
          recurso: 'Pedido',
          recursoId: id,
          detalhes: JSON.stringify({ codigo: pedido.codigo }),
        },
      });
    });
  }

  private async gerarCodigoPedido(): Promise<string> {
    const total = await this.prisma.pedido.count();
    return `PED-${String(total + 1).padStart(4, '0')}`;
  }

  private pedidoInclude() {
    return {
      cliente: { select: { nome: true } },
      unidade: { select: { nome: true } },
      itens: {
        include: {
          produto: { select: { nome: true } },
        },
      },
    };
  }

  private toResponse(pedido: PedidoComRelacoes): PedidoResponseDto {
    return {
      id: pedido.id,
      codigo: pedido.codigo,
      clienteId: pedido.clienteId,
      clienteNome: pedido.cliente.nome,
      unidadeId: pedido.unidadeId,
      unidadeNome: pedido.unidade.nome,
      canalPedido: pedido.canalPedido,
      status: pedido.status,
      totalCentavos: pedido.totalCentavos,
      itens: pedido.itens.map((item) => ({
        produtoId: item.produtoId,
        produtoNome: item.produto.nome,
        quantidade: item.quantidade,
        precoUnitarioCentavos: item.precoUnitarioCentavos,
        subtotalCentavos: item.subtotalCentavos,
      })),
      createdAt: pedido.createdAt,
    };
  }
}
