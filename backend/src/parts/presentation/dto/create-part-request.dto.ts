import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import CreatePartInputDTO from '@parts/application/dtos/create-part-input.dto';

export default class CreatePartRequestDto implements CreatePartInputDTO {
  @ApiProperty({ description: 'Part name', example: 'Filtro de oleo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Part description',
    example: 'Filtro de oleo do motor',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Unit price', example: 45.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    description: 'Current stock quantity',
    example: 10,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;
}
