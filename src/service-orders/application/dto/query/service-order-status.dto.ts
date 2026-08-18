import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

export class ServiceOrderStatusDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ServiceOrderStatus })
  status: ServiceOrderStatus;

  @ApiProperty()
  updatedAt: Date;
}
