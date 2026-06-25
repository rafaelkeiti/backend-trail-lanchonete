import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class MockPagamentoDto {
  @ApiProperty({ example: 'clx-pedido-id' })
  @IsString()
  pedidoId: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Se falso, vai simula rpagamento negado.',
  })
  @IsOptional()
  @IsBoolean()
  aprovado?: boolean;
}
