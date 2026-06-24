import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export default class PartResponseDto {
  @ApiProperty({ description: 'Part ID' })
  id!: string;

  @ApiProperty({ description: 'Part name' })
  name!: string;

  @ApiPropertyOptional({ description: 'Part description', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Unit price' })
  price!: number;

  @ApiProperty({ description: 'Current stock quantity' })
  stockQuantity!: number;

  @ApiProperty({ description: 'Registration date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt!: Date;
}
