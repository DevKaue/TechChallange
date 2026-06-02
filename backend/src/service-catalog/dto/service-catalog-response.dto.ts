import { ApiProperty } from '@nestjs/swagger';

export class ServiceCatalogResponseDto {
  @ApiProperty({ description: 'Service ID' })
  id: string;

  @ApiProperty({ description: 'Service name' })
  name: string;

  @ApiProperty({
    description: 'Service description',
    required: false,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'Service price' })
  price: number;

  @ApiProperty({ description: 'Registration date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
