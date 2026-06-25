import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ErrorDetailDto {
  @ApiProperty({ example: 'itens[0].quantidade' })
  field: string;

  @ApiProperty({ example: 'Disponível: 1' })
  issue: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 'ESTOQUE_INSUFICIENTE' })
  error: string;

  @ApiProperty({ example: 'Não existe quantidade suficiente' })
  message: string;

  @ApiProperty({ type: [ErrorDetailDto] })
  details: ErrorDetailDto[];

  @ApiProperty({ example: '2026-06-25T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/pedidos' })
  path: string;

  @ApiPropertyOptional({ example: '0d6d5d5a-98e5-4d5d-8f8a-123456789abc' })
  requestId?: string;
}
