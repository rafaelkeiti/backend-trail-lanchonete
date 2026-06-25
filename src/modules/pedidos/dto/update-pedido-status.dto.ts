import { ApiProperty } from '@nestjs/swagger';
import { StatusPedido } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdatePedidoStatusDto {
  @ApiProperty({
    enum: StatusPedido,
    example: StatusPedido.EM_PREPARO,
  })
  @IsEnum(StatusPedido)
  status: StatusPedido;
}
