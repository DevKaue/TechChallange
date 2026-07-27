import { Module } from '@nestjs/common';
import { ServiceOrderController } from './presentation/controllers/service-order.controller';
import { EstimateController } from './presentation/controllers/estimate.controller';
import { MechanicController } from './presentation/controllers/mechanic.controller';
import { DiagnosisController } from './presentation/controllers/diagnosis.controller';
import { MetricsController } from './presentation/controllers/metrics.controller';
//import { ServiceOrderUseCase } from './application/usecases/service-order/service-order.use-case';
//import { EstimateUseCase } from './application/usecases/estimate/estimate.use-case';
//import { MechanicUseCase } from './application/usecases/mechanic/mechanic.use-case';
//import { MetricsUseCase } from './application/usecases/metrics/get-avetage-execution-time.use-case';
import { ServiceOrdersRepositoryInterface } from './domain/contracts/service-orders-repository.interface';
import { PrismaServiceOrdersRepository } from './infra/repositories/prisma-service-orders.repository';
import { ServiceOrderQueryServiceInterface } from './application/contracts/service-order-query-service.interface';
import { PrismaServiceOrderQueryService } from './infra/services/prisma-service-order-query.service';
import { SERVICE_ORDERS_INTERFACE } from './application/contracts/service-orders-public.interface';
import { ServiceOrdersFacade } from './infra/integrations/service-orders.facade';
import { MaterialsModule } from '@materials/infra/materials.module';
import { ServiceCatalogModule } from '@service-catalog/infra/service-catalog.module';
import { CustomerManagementModule } from '@customer-management/infra/customer-management.module';
import { AccessIdentityModule } from '@access-identity/access-identity.module';
import { StartDiagnosisUseCase } from './application/usecases/diagnosis/startDiagnosis.use-case';
import { AddEstimateItemUseCase } from './application/usecases/estimate/add-estimate-item.use-case';
import { CreateEstimateUseCase } from './application/usecases/estimate/create-estimate.use-case';
import { RejectEstimateUseCase } from './application/usecases/estimate/reject-estimate.use-case';
import { UpdateEstimateStatusUseCase } from './application/usecases/estimate/update-estimate-status.use-case';
import { AssignMechanicUseCase } from './application/usecases/mechanic/assign-mechanic.use-case';
import { UpdateMechanicAvailabilityUseCase } from './application/usecases/mechanic/update-mechanic-availability.use-case';
import { GetAverageExecutionTimeUseCase } from './application/usecases/metrics/get-avetage-execution-time.use-case';
import { CloseServiceOrderUseCase } from './application/usecases/service-order/close-service-order.use-case';
import { CreateServiceOrderUseCase } from './application/usecases/service-order/create-service-order.use-case';
import { DeliverVehicleUseCase } from './application/usecases/service-order/deliver-vehicle.use-case';
import { FindAllServiceOrdersUseCase } from './application/usecases/service-order/find-all-service-orders.use-case';
import { FindOneServiceOrderUseCase } from './application/usecases/service-order/find-one-service-order.use-case';
import { FinishServiceUseCase } from './application/usecases/service-order/finish-service.use-case';
import { StartServiceUseCase } from './application/usecases/service-order/start-service.use-case';

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
    // ServiceOrderUseCase,
    // EstimateUseCase,
    // MechanicUseCase,
    // MetricsUseCase,
    StartDiagnosisUseCase,
    AddEstimateItemUseCase,
    CreateEstimateUseCase,
    RejectEstimateUseCase,
    UpdateEstimateStatusUseCase,
    AssignMechanicUseCase,
    UpdateMechanicAvailabilityUseCase,
    GetAverageExecutionTimeUseCase,
    CloseServiceOrderUseCase,
    CreateServiceOrderUseCase,
    DeliverVehicleUseCase,
    FindAllServiceOrdersUseCase,
    FindOneServiceOrderUseCase, 
    FinishServiceUseCase,
    StartServiceUseCase,
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
    // ACLs cross-context (CUSTOMER/VEHICLE/USER/PART/SERVICE_CATALOG) são providos
    // e exportados pelos módulos donos e chegam aqui via os imports acima.
  ],
  exports: [SERVICE_ORDERS_INTERFACE],
})
export class ServiceOrdersModule { }
