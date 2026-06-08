import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StartServiceDto {
  @ApiProperty({ description: 'Service Order ID to start execution' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  serviceOrderId: string;

  @ApiProperty({ description: 'Start time for the service execution' })
  @IsNotEmpty()
  @IsString()
  startTime: Date;
}
