import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusPagamento, StatusPedido } from '@prisma/client';

export class PagamentoResponseDto {
  @ApiProperty({ example: 'clx-pagamento-id' })
  id: string;

  @ApiProperty({ example: 'clx-pedido-id' })
  pedidoId: string;

  @ApiProperty({ enum: StatusPagamento, example: StatusPagamento.APROVADO })
  status: StatusPagamento;

  @ApiProperty({ example: 'MOCK' })
  metodo: string;

  @ApiProperty({ example: 3280 })
  valorCentavos: number;

  @ApiProperty({ enum: StatusPedido, example: StatusPedido.PAGO })
  pedidoStatus: StatusPedido;

  @ApiPropertyOptional({ example: 3 })
  pontosGerados?: number;

  @ApiProperty({ example: '2026-06-25T12:00:00.000Z' })
  createdAt: Date;
}
