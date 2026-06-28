import { Injectable } from '@nestjs/common';
import { Auditoria } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaResponseDto } from './dto/auditoria-response.dto';

type AuditoriaComUsuario = Auditoria & {
  usuario: { nome: string } | null;
};

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(limit = 50): Promise<AuditoriaResponseDto[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const auditorias = await this.prisma.auditoria.findMany({
      take: safeLimit,
      include: {
        usuario: {
          select: { nome: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return auditorias.map((auditoria) => this.toResponse(auditoria));
  }

  private toResponse(auditoria: AuditoriaComUsuario): AuditoriaResponseDto {
    return {
      id: auditoria.id,
      usuarioId: auditoria.usuarioId,
      usuarioNome: auditoria.usuario?.nome,
      acao: auditoria.acao,
      recurso: auditoria.recurso,
      recursoId: auditoria.recursoId,
      detalhes: auditoria.detalhes,
      createdAt: auditoria.createdAt,
    };
  }
}
