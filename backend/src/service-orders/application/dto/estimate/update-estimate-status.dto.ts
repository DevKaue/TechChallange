import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstimateStatus } from '@prisma/client';

export class UpdateEstimateStatusDto {
  @ApiProperty({
    enum: EstimateStatus,
    description: 'APPROVED, REJECTED, or NEGOTIATED',
  })
  @IsEnum(EstimateStatus)
  @IsNotEmpty()
  status: EstimateStatus;
}
