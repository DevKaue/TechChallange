import { Injectable } from '@nestjs/common';
import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';

@Injectable()
export class FindAllServiceOrdersUseCase {
  constructor(
    private readonly queryService: ServiceOrderQueryServiceInterface,
  ) {}

  async execute() {
    return this.queryService.findAll();
  }
}