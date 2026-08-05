import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { UpdateServiceInput } from '@service-catalog/application/usecases/update-service-catalog.use-case';

export class UpdateServiceRequestDto implements UpdateServiceInput {
  @ApiPropertyOptional({ example: 'Troca de óleo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Troca de óleo e filtro' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
