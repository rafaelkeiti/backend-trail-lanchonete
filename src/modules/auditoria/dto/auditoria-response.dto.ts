import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditoriaResponseDto {
  @ApiProperty({ example: 'clx-auditoria-id' })
  id: string;

  @ApiPropertyOptional({ example: 'clx-usuario-id' })
  usuarioId?: string | null;

  @ApiPropertyOptional({ example: 'Cliente Teste' })
  usuarioNome?: string | null;

  @ApiProperty({ example: 'PEDIDO_CRIADO' })
  acao: string;

  @ApiProperty({ example: 'Pedido' })
  recurso: string;

  @ApiPropertyOptional({ example: 'clx-pedido-id' })
  recursoId?: string | null;

  @ApiPropertyOptional({ example: '{"codigo":"PED-0002"}' })
  detalhes?: string | null;

  @ApiProperty({ example: '2026-06-25T12:00:00.000Z' })
  createdAt: Date;
}
