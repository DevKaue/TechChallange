import { Module } from '@nestjs/common';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersUseCase } from './service-orders.use-case';
import { ServiceOrdersRepositoryInterface } from './service-orders-repository.interface';
import { ServiceOrdersRepository } from './service-orders.repository';

@Module({
  controllers: [ServiceOrdersController],
  providers: [
    ServiceOrdersUseCase,
    {
      provide: ServiceOrdersRepositoryInterface,
      useClass: ServiceOrdersRepository,
    },
  ],
})
export class ServiceOrdersModule {}
