import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';

export class EstimateApprovalNotificationDto {
  @ApiProperty({
    enum: [EstimateStatus.APPROVED, EstimateStatus.REJECTED],
  })
  @IsIn([EstimateStatus.APPROVED, EstimateStatus.REJECTED])
  status: EstimateStatus.APPROVED | EstimateStatus.REJECTED;

  @ApiPropertyOptional({ description: 'Reason supplied when rejected' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
