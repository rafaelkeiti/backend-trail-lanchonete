import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Estoque, TipoMovimentacaoEstoque } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { EstoqueResponseDto } from './dto/estoque-response.dto';
import { MovimentarEstoqueDto } from './dto/movimentar-estoque.dto';

type EstoqueComRelacoes = Estoque & {
  unidade: { nome: string };
  produto: { nome: string };
};

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUnidade(unidadeId: string): Promise<EstoqueResponseDto[]> {
    const unidade = await this.prisma.unidade.findUnique({
      where: { id: unidadeId },
      select: { id: true },
    });

    if (!unidade) {
      throw new NotFoundException('Unidade não encontrada.');
    }

    const estoques = await this.prisma.estoque.findMany({
      where: { unidadeId },
      include: {
        unidade: { select: { nome: true } },
        produto: { select: { nome: true } },
      },
      orderBy: { produto: { nome: 'asc' } },
    });

    return estoques.map((estoque) => this.toResponse(estoque));
  }

  async movimentar(
    dto: MovimentarEstoqueDto,
    usuario: AuthenticatedUser,
  ): Promise<EstoqueResponseDto> {
    await this.ensureUnidadeAndProduto(dto.unidadeId, dto.produtoId);

    const estoque = await this.prisma.estoque.upsert({
      where: {
        unidadeId_produtoId: {
          unidadeId: dto.unidadeId,
          produtoId: dto.produtoId,
        },
      },
      update: {},
      create: {
        unidadeId: dto.unidadeId,
        produtoId: dto.produtoId,
        quantidade: 0,
        minimo: 0,
      },
      include: {
        unidade: { select: { nome: true } },
        produto: { select: { nome: true } },
      },
    });

    const novaQuantidade = this.calcularNovaQuantidade(estoque.quantidade, dto);

    const estoqueAtualizado = await this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.estoque.update({
        where: { id: estoque.id },
        data: { quantidade: novaQuantidade },
        include: {
          unidade: { select: { nome: true } },
          produto: { select: { nome: true } },
        },
      });

      await tx.movimentacaoEstoque.create({
        data: {
          estoqueId: estoque.id,
          usuarioId: usuario.id,
          tipo: dto.tipo,
          quantidade: dto.quantidade,
          motivo: dto.motivo,
        },
      });

      await tx.auditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: 'MOVIMENTACAO_ESTOQUE',
          recurso: 'Estoque',
          recursoId: estoque.id,
          detalhes: JSON.stringify({
            tipo: dto.tipo,
            quantidade: dto.quantidade,
            perfil: usuario.perfil,
          }),
        },
      });

      return atualizado;
    });

    return this.toResponse(estoqueAtualizado);
  }

  private calcularNovaQuantidade(quantidadeAtual: number, dto: MovimentarEstoqueDto): number {
    if (dto.tipo === TipoMovimentacaoEstoque.ENTRADA || dto.tipo === TipoMovimentacaoEstoque.ESTORNO) {
      return quantidadeAtual + dto.quantidade;
    }

    const novaQuantidade = quantidadeAtual - dto.quantidade;

    if (novaQuantidade < 0) {
      throw new ConflictException('Estoque insuficiente para esta movimentação.');
    }

    return novaQuantidade;
  }

  private async ensureUnidadeAndProduto(unidadeId: string, produtoId: string): Promise<void> {
    const [unidade, produto] = await Promise.all([
      this.prisma.unidade.findUnique({ where: { id: unidadeId }, select: { id: true } }),
      this.prisma.produto.findUnique({ where: { id: produtoId }, select: { id: true } }),
    ]);

    if (!unidade) {
      throw new NotFoundException('Unidade não encontrada.');
    }

    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
  }

  private toResponse(estoque: EstoqueComRelacoes): EstoqueResponseDto {
    return {
      id: estoque.id,
      unidadeId: estoque.unidadeId,
      unidadeNome: estoque.unidade.nome,
      produtoId: estoque.produtoId,
      produtoNome: estoque.produto.nome,
      quantidade: estoque.quantidade,
      minimo: estoque.minimo,
    };
  }
}
