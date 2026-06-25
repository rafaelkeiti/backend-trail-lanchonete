import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Pagamento, StatusPagamento, StatusPedido } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { MockPagamentoDto } from './dto/mock-pagamento.dto';
import { PagamentoResponseDto } from './dto/pagamento-response.dto';

type PagamentoComPedido = Pagamento & {
  pedido: {
    status: StatusPedido;
  };
};

@Injectable()
export class PagamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async processarMock(
    dto: MockPagamentoDto,
    usuario: AuthenticatedUser,
  ): Promise<PagamentoResponseDto> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
      include: { pagamento: true, cliente: true },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (pedido.pagamento) {
      throw new ConflictException('Pedido já possui pagamento registrado.');
    }

    if (pedido.status !== StatusPedido.AGUARDANDO_PAGAMENTO) {
      throw new ConflictException('Pedido não está aguardando pagamento.');
    }

    const aprovado = dto.aprovado ?? true;
    const statusPagamento = aprovado ? StatusPagamento.APROVADO : StatusPagamento.NEGADO;
    const statusPedido = aprovado ? StatusPedido.PAGO : StatusPedido.PAGAMENTO_NEGADO;
    const pontosGerados = aprovado && pedido.cliente.consentimentoFidelidade
      ? Math.floor(pedido.totalCentavos / 1000)
      : 0;

    const pagamento = await this.prisma.$transaction(async (tx) => {
      const criado = await tx.pagamento.create({
        data: {
          pedidoId: pedido.id,
          status: statusPagamento,
          metodo: 'MOCK',
          valorCentavos: pedido.totalCentavos,
          providerPayload: JSON.stringify({
            provider: 'mock',
            aprovado,
            autorizacao: aprovado ? `MOCK-${pedido.codigo}` : null,
          }),
        },
        include: {
          pedido: {
            select: { status: true },
          },
        },
      });

      await tx.pedido.update({
        where: { id: pedido.id },
        data: { status: statusPedido },
      });

      if (pontosGerados > 0) {
        await tx.fidelidade.upsert({
          where: { usuarioId: pedido.clienteId },
          update: { pontos: { increment: pontosGerados } },
          create: {
            usuarioId: pedido.clienteId,
            pontos: pontosGerados,
          },
        });
      }

      await tx.auditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: 'PAGAMENTO_MOCK_PROCESSADO',
          recurso: 'Pagamento',
          recursoId: criado.id,
          detalhes: JSON.stringify({
            pedidoId: pedido.id,
            statusPagamento,
            statusPedido,
            pontosGerados,
          }),
        },
      });

      return {
        ...criado,
        pedido: {
          status: statusPedido,
        },
      };
    });

    return this.toResponse(pagamento, pontosGerados);
  }

  async findOne(id: string): Promise<PagamentoResponseDto> {
    const pagamento = await this.prisma.pagamento.findUnique({
      where: { id },
      include: {
        pedido: {
          select: { status: true },
        },
      },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não foi encontrado');
    }

    return this.toResponse(pagamento);
  }

  private toResponse(
    pagamento: PagamentoComPedido,
    pontosGerados?: number,
  ): PagamentoResponseDto {
    return {
      id: pagamento.id,
      pedidoId: pagamento.pedidoId,
      status: pagamento.status,
      metodo: pagamento.metodo,
      valorCentavos: pagamento.valorCentavos,
      pedidoStatus: pagamento.pedido.status,
      pontosGerados,
      createdAt: pagamento.createdAt,
    };
  }
}
