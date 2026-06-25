import { ApiProperty } from '@nestjs/swagger';

export class EstoqueResponseDto {
  @ApiProperty({ example: 'clx0000000000000000000000' })
  id: string;

  @ApiProperty({ example: 'clx-unidade-id' })
  unidadeId: string;

  @ApiProperty({ example: 'Unidade Centro' })
  unidadeNome: string;

  @ApiProperty({ example: 'clx-produto-id' })
  produtoId: string;

  @ApiProperty({ example: 'X-Burger' })
  produtoNome: string;

  @ApiProperty({ example: 30 })
  quantidade: number;

  @ApiProperty({ example: 5 })
  minimo: number;
}
