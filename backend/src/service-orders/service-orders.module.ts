import { Module } from '@nestjs/common';
import { ServiceOrdersController } from './presentation/controllers/service-orders.controller';
import { ServiceOrdersUseCase } from './application/usecases/service-orders.use-case';
import { ServiceOrdersRepositoryInterface } from './domain/contracts/service-orders-repository.interface';
import { ServiceOrdersRepository } from './infra/repositories/service-orders.repository';

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
