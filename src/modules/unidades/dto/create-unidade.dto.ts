import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUnidadeDto {
  @ApiProperty({ example: 'Unidade Centro' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'CENTRO' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'Rua Principal, 100' })
  @IsString()
  @IsNotEmpty()
  endereco: string;
}
