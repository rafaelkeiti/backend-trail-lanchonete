import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProdutoResponseDto {
  @ApiProperty({ example: 'clx0000000000000000000000' })
  id: string;

  @ApiProperty({ example: 'X-Burger' })
  nome: string;

  @ApiPropertyOptional({ example: 'Hambúrguer simples com queijo.' })
  descricao?: string | null;

  @ApiProperty({ example: 1990 })
  precoCentavos: number;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiProperty({ example: '2026-06-25T12:00:00.000Z' })
  createdAt: Date;
}
