import { ApiProperty } from '@nestjs/swagger';
import { CanalPedido, StatusPedido } from '@prisma/client';

class PedidoItemResponseDto {
  @ApiProperty({ example: 'clx-produto-id' })
  produtoId: string;

  @ApiProperty({ example: 'X-Burger' })
  produtoNome: string;

  @ApiProperty({ example: 2 })
  quantidade: number;

  @ApiProperty({ example: 1990 })
  precoUnitarioCentavos: number;

  @ApiProperty({ example: 3980 })
  subtotalCentavos: number;
}

export class PedidoResponseDto {
  @ApiProperty({ example: 'clx0000000000000000000000' })
  id: string;

  @ApiProperty({ example: 'PED-0001' })
  codigo: string;

  @ApiProperty({ example: 'clx-cliente-id' })
  clienteId: string;

  @ApiProperty({ example: 'Cliente Teste' })
  clienteNome: string;

  @ApiProperty({ example: 'clx-unidade-id' })
  unidadeId: string;

  @ApiProperty({ example: 'Unidade Centro' })
  unidadeNome: string;

  @ApiProperty({ enum: CanalPedido, example: CanalPedido.TOTEM })
  canalPedido: CanalPedido;

  @ApiProperty({ enum: StatusPedido, example: StatusPedido.AGUARDANDO_PAGAMENTO })
  status: StatusPedido;

  @ApiProperty({ example: 3980 })
  totalCentavos: number;

  @ApiProperty({ type: [PedidoItemResponseDto] })
  itens: PedidoItemResponseDto[];

  @ApiProperty({ example: '2026-06-25T12:00:00.000Z' })
  createdAt: Date;
}
