import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { ProdutoResponseDto } from './dto/produto-response.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

const unidadesDisponiveisInclude = {
  estoques: {
    where: {
      quantidade: { gt: 0 },
      unidade: { ativa: true },
    },
    select: {
      unidade: {
        select: { id: true, nome: true },
      },
    },
  },
} satisfies Prisma.ProdutoInclude;

type ProdutoComUnidades = Prisma.ProdutoGetPayload<{
  include: typeof unidadesDisponiveisInclude;
}>;

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProdutoDto): Promise<ProdutoResponseDto> {
    const produto = await this.prisma.produto.create({
      data: dto,
      include: unidadesDisponiveisInclude,
    });

    return this.toResponse(produto);
  }

  async findAll(page = 1, limit = 10): Promise<{
    data: ProdutoResponseDto[];
    page: number;
    limit: number;
    total: number;
  }> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    const [produtos, total] = await this.prisma.$transaction([
      this.prisma.produto.findMany({
        skip,
        take: safeLimit,
        include: unidadesDisponiveisInclude,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.produto.count(),
    ]);

    return {
      data: produtos.map((produto) => this.toResponse(produto)),
      page: safePage,
      limit: safeLimit,
      total,
    };
  }

  async findOne(id: string): Promise<ProdutoResponseDto> {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: unidadesDisponiveisInclude,
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }

    return this.toResponse(produto);
  }

  async update(id: string, dto: UpdateProdutoDto): Promise<ProdutoResponseDto> {
    await this.ensureExists(id);

    const produto = await this.prisma.produto.update({
      where: { id },
      data: dto,
      include: unidadesDisponiveisInclude,
    });

    return this.toResponse(produto);
  }

  private async ensureExists(id: string): Promise<void> {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
  }

  private toResponse(produto: ProdutoComUnidades): ProdutoResponseDto {
    return {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      precoCentavos: produto.precoCentavos,
      ativo: produto.ativo,
      unidadesDisponiveis: produto.estoques.map((estoque) => estoque.unidade),
      createdAt: produto.createdAt,
    };
  }
}
