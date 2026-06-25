import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class ResgatarPontosDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  pontos: number;
}
