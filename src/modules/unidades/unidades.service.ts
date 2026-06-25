import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Unidade } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnidadeDto } from './dto/create-unidade.dto';
import { UnidadeResponseDto } from './dto/unidade-response.dto';

@Injectable()
export class UnidadesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUnidadeDto): Promise<UnidadeResponseDto> {
    const existingUnit = await this.prisma.unidade.findUnique({
      where: { codigo: dto.codigo },
    });

    if (existingUnit) {
      throw new ConflictException('Já existe uma unidade com este código.');
    }

    const unidade = await this.prisma.unidade.create({
      data: {
        nome: dto.nome,
        codigo: dto.codigo.toUpperCase(),
        endereco: dto.endereco,
      },
    });

    return this.toResponse(unidade);
  }

  async findAll(): Promise<UnidadeResponseDto[]> {
    const unidades = await this.prisma.unidade.findMany({
      orderBy: { nome: 'asc' },
    });

    return unidades.map((unidade) => this.toResponse(unidade));
  }

  async findOne(id: string): Promise<UnidadeResponseDto> {
    const unidade = await this.prisma.unidade.findUnique({
      where: { id },
    });

    if (!unidade) {
      throw new NotFoundException('Unidade não encontrada.');
    }

    return this.toResponse(unidade);
  }

  private toResponse(unidade: Unidade): UnidadeResponseDto {
    return {
      id: unidade.id,
      nome: unidade.nome,
      codigo: unidade.codigo,
      endereco: unidade.endereco,
      ativa: unidade.ativa,
      createdAt: unidade.createdAt,
    };
  }
}
