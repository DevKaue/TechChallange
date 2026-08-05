import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { CreateServiceInput } from '@service-catalog/application/usecases/create-service-catalog.use-case';

export class CreateServiceRequestDto implements CreateServiceInput {
  @ApiProperty({ example: 'Troca de óleo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Troca de óleo e filtro' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  price!: number;
}
