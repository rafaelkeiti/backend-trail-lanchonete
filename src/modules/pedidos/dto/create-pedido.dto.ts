import { ApiProperty } from '@nestjs/swagger';
import { CanalPedido } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class CreatePedidoItemDto {
  @ApiProperty({ example: 'clx-produto-id' })
  @IsString()
  @IsNotEmpty()
  produtoId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  quantidade: number;
}

export class CreatePedidoDto {
  @ApiProperty({ enum: CanalPedido, example: CanalPedido.TOTEM })
  @IsEnum(CanalPedido)
  canalPedido: CanalPedido;

  @ApiProperty({ example: 'clx-unidade-id' })
  @IsString()
  @IsNotEmpty()
  unidadeId: string;

  @ApiProperty({ type: [CreatePedidoItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoItemDto)
  itens: CreatePedidoItemDto[];
}
