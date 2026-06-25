import { ApiProperty } from '@nestjs/swagger';

export class FidelidadeResponseDto {
  @ApiProperty({ example: 'clx-fidelidade-id' })
  id: string;

  @ApiProperty({ example: 'clx-usuario-id' })
  usuarioId: string;

  @ApiProperty({ example: 25 })
  pontos: number;

  @ApiProperty({ example: '2026-06-25T12:00:00.000Z' })
  updatedAt: Date;
}
