import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoMovimentacaoEstoque } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class MovimentarEstoqueDto {
  @ApiProperty({ example: 'clx-unidade-id' })
  @IsString()
  @IsNotEmpty()
  unidadeId: string;

  @ApiProperty({ example: 'clx-produto-id' })
  @IsString()
  @IsNotEmpty()
  produtoId: string;

  @ApiProperty({ enum: TipoMovimentacaoEstoque, example: TipoMovimentacaoEstoque.ENTRADA })
  @IsEnum(TipoMovimentacaoEstoque)
  tipo: TipoMovimentacaoEstoque;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantidade: number;

  @ApiPropertyOptional({ example: 'Reposição de estoque' })
  @IsOptional()
  @IsString()
  motivo?: string;
}
