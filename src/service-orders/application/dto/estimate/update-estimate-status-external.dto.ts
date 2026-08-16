import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum EstimateExternalDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateEstimateStatusExternalDto {
  @ApiProperty({
    enum: EstimateExternalDecision,
    description: 'APPROVED or REJECTED',
  })
  @IsEnum(EstimateExternalDecision)
  @IsNotEmpty()
  decision: EstimateExternalDecision;
}
