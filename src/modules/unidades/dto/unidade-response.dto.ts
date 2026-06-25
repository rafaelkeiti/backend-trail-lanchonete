import { ApiProperty } from '@nestjs/swagger';

export class UnidadeResponseDto {
  @ApiProperty({ example: 'clx0000000000000000000000' })
  id: string;

  @ApiProperty({ example: 'Unidade Centro' })
  nome: string;

  @ApiProperty({ example: 'CENTRO' })
  codigo: string;

  @ApiProperty({ example: 'Rua Principal, 100' })
  endereco: string;

  @ApiProperty({ example: true })
  ativa: boolean;

  @ApiProperty({ example: '2026-06-25T12:00:00.000Z' })
  createdAt: Date;
}
