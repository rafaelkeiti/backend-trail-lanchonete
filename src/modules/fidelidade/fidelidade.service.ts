import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Fidelidade } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { FidelidadeResponseDto } from './dto/fidelidade-response.dto';
import { ResgatarPontosDto } from './dto/resgatar-pontos.dto';

@Injectable()
export class FidelidadeService {
  constructor(private readonly prisma: PrismaService) {}

  async saldo(usuario: AuthenticatedUser): Promise<FidelidadeResponseDto> {
    const fidelidade = await this.prisma.fidelidade.findUnique({
      where: { usuarioId: usuario.id },
    });

    if (!fidelidade) {
      throw new NotFoundException('Cliente não possui saldo de fidelidade.');
    }

    return this.toResponse(fidelidade);
  }

  async resgatar(
    dto: ResgatarPontosDto,
    usuario: AuthenticatedUser,
  ): Promise<FidelidadeResponseDto> {
    const fidelidade = await this.prisma.fidelidade.findUnique({
      where: { usuarioId: usuario.id },
    });

    if (!fidelidade) {
      throw new NotFoundException('Cliente não possui saldo de fidelidade.');
    }

    if (fidelidade.pontos < dto.pontos) {
      throw new ConflictException('Saldo de pontos insuficiente.');
    }

    const atualizado = await this.prisma.$transaction(async (tx) => {
      const saldoAtualizado = await tx.fidelidade.update({
        where: { usuarioId: usuario.id },
        data: {
          pontos: {
            decrement: dto.pontos,
          },
        },
      });

      await tx.auditoria.create({
        data: {
          usuarioId: usuario.id,
          acao: 'FIDELIDADE_RESGATE',
          recurso: 'Fidelidade',
          recursoId: saldoAtualizado.id,
          detalhes: JSON.stringify({ pontosResgatados: dto.pontos }),
        },
      });

      return saldoAtualizado;
    });

    return this.toResponse(atualizado);
  }

  private toResponse(fidelidade: Fidelidade): FidelidadeResponseDto {
    return {
      id: fidelidade.id,
      usuarioId: fidelidade.usuarioId,
      pontos: fidelidade.pontos,
      updatedAt: fidelidade.updatedAt,
    };
  }
}
