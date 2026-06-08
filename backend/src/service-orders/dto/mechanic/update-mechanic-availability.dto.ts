import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateMechanicAvailabilityDto {
  @ApiProperty({ description: 'Mechanic user ID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  mechanicId: string;

  @ApiProperty({ description: 'Mechanic availability status' })
  @IsBoolean()
  @IsNotEmpty()
  available: boolean;
}
