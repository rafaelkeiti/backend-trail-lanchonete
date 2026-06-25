import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({ example: 'X-Burger' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ example: 'Hambúrguer simples com queijo.' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 1990, description: 'Preço em centavos.' })
  @IsInt()
  @IsPositive()
  precoCentavos: number;
}
