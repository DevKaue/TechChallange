import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateServiceOrderItemDto {
  @ApiProperty({ description: 'Service or material UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  referenceId: string;

  @ApiProperty({ description: 'Requested quantity' })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiPropertyOptional({ description: 'Optional item description' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}

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

  @ApiPropertyOptional({ type: [CreateServiceOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderItemDto)
  services?: CreateServiceOrderItemDto[];

  @ApiPropertyOptional({ type: [CreateServiceOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderItemDto)
  parts?: CreateServiceOrderItemDto[];
}
