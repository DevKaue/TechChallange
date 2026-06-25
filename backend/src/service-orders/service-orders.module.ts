import { Module } from '@nestjs/common';
import { ServiceOrderController } from './presentation/controllers/service-order.controller';
import { EstimateController } from './presentation/controllers/estimate.controller';
import { MechanicController } from './presentation/controllers/mechanic.controller';
import { DiagnosisController } from './presentation/controllers/diagnosis.controller';
import { MetricsController } from './presentation/controllers/metrics.controller';
import { ServiceOrderUseCase } from './application/usecases/service-order.use-case';
import { EstimateUseCase } from './application/usecases/estimate.use-case';
import { MechanicUseCase } from './application/usecases/mechanic.use-case';
import { DiagnosisUseCase } from './application/usecases/diagnosis.use-case';
import { MetricsUseCase } from './application/usecases/metrics.use-case';
import { ServiceOrdersRepositoryInterface } from './domain/contracts/service-orders-repository.interface';
import { PrismaServiceOrdersRepository } from './infra/repositories/prisma-service-orders.repository';
import { ServiceOrderQueryServiceInterface } from './application/contracts/service-order-query-service.interface';
import { PrismaServiceOrderQueryService } from './infra/services/prisma-service-order-query.service';
import { SERVICE_ORDERS_INTERFACE } from './application/contracts/service-orders-public.interface';
import { ServiceOrdersFacade } from './infra/integrations/service-orders.facade';
import { MaterialsModule } from '../materials/infra/materials.module';
import { ServiceCatalogModule } from '../service-catalog/infra/service-catalog.module';
import { CustomerManagementModule } from '../customer-management/infra/customer-management.module';
import { AccessIdentityModule } from '../access-identity/access-identity.module';

@Module({
  imports: [
    MaterialsModule,
    ServiceCatalogModule,
    CustomerManagementModule,
    AccessIdentityModule,
  ],
  controllers: [
    ServiceOrderController,
    EstimateController,
    MechanicController,
    DiagnosisController,
    MetricsController,
  ],
  providers: [
    ServiceOrderUseCase,
    EstimateUseCase,
    MechanicUseCase,
    DiagnosisUseCase,
    MetricsUseCase,
    {
      provide: ServiceOrdersRepositoryInterface,
      useClass: PrismaServiceOrdersRepository,
    },
    {
      provide: ServiceOrderQueryServiceInterface,
      useClass: PrismaServiceOrderQueryService,
    },
    ServiceOrdersFacade,
    {
      provide: SERVICE_ORDERS_INTERFACE,
      useExisting: ServiceOrdersFacade,
    },
    // ACLs cross-context (CLIENT/VEHICLE/USER/PART/SERVICE_CATALOG) são providos
    // e exportados pelos módulos donos e chegam aqui via os imports acima.
  ],
  exports: [SERVICE_ORDERS_INTERFACE],
})
export class ServiceOrdersModule {}
