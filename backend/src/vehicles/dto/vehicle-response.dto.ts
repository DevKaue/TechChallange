import { ApiProperty } from '@nestjs/swagger';
import { ClientResponseDto } from '@/clients/dto/client-response.dto';

export class VehicleResponseDto {
  @ApiProperty({ description: 'Vehicle ID' })
  id: string;

  @ApiProperty({ description: 'License plate' })
  plate: string;

  @ApiProperty({ description: 'Brand' })
  brand: string;

  @ApiProperty({ description: 'Model' })
  model: string;

  @ApiProperty({ description: 'Manufacturing year' })
  year: number;

  @ApiProperty({ description: 'Owner client ID' })
  clientId: string;

  @ApiProperty({
    description: 'Owner client data',
    required: false,
    type: () => ClientResponseDto,
  })
  client?: ClientResponseDto;

  @ApiProperty({ description: 'Registration date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
