import { IsEnum, IsNotEmpty } from 'class-validator';
import { ServiceOrderStatus } from '@prisma/client';

export class UpdateServiceOrderStatusDto {
  @IsEnum(ServiceOrderStatus)
  @IsNotEmpty()
  status: ServiceOrderStatus;
}
