import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class FinishServiceDto {
  @ApiProperty({ description: 'Service Order ID to finish' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  serviceOrderId: string;

  @ApiPropertyOptional({ description: 'Completion notes or observations' })
  @IsOptional()
  @IsString()
  notes?: string;
}
