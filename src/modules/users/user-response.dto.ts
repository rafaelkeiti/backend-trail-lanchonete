import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'clx0000000000000000000000' })
  id: string;

  @ApiProperty({ example: 'Cliente Teste' })
  nome: string;

  @ApiProperty({ example: 'cliente@exemplo.com' })
  email: string;

  @ApiPropertyOptional({ example: '11999990000' })
  telefone?: string | null;

  @ApiProperty({ enum: PerfilUsuario, example: PerfilUsuario.CLIENTE })
  perfil: PerfilUsuario;

  @ApiProperty({ example: true })
  consentimentoFidelidade: boolean;

  @ApiProperty({ example: '2026-06-25T12:00:00.000Z' })
  createdAt: Date;
}
