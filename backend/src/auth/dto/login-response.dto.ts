import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthenticatedUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: 'Bearer';

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;
}
