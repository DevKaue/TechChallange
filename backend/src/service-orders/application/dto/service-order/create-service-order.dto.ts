import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateServiceOrderDto {
  @ApiProperty({ description: 'Client UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Vehicle UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;
}
