import { ServiceOrderSummaryDto } from '@service-orders/application/dto/query/service-order-summary.dto';
import { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';

export abstract class ServiceOrderQueryServiceInterface {
  abstract findAll(): Promise<ServiceOrderSummaryDto[]>;

  abstract findOne(id: string): Promise<ServiceOrderDetailDto | null>;
}
