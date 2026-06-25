import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ example: 'jwt...' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
