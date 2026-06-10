import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FinishOrderDto {
  @ApiPropertyOptional({ description: 'Completion notes about the service performed' })
  @IsOptional()
  @IsString()
  notes?: string;
}
