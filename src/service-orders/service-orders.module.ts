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
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import { SERVICE_CATALOG_REPOSITORY } from '@service-orders/domain/acls/service-catalog-repository.interface';
import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';
import CustomerManagementInterface from '@common/contracts/customer-management.interface';
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
import { UpdateServiceOrderStatusUseCase } from './application/usecases/service-order/update-service-order-status.use-case';
import { FindServiceOrderStatusUseCase } from './application/usecases/service-order/find-service-order-status.use-case';

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
    {
      provide: StartDiagnosisUseCase,
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new StartDiagnosisUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
    },
    {
      provide: CreateEstimateUseCase,
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new CreateEstimateUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
    },
    {
      provide: UpdateEstimateStatusUseCase,
      useFactory: (
        repository: ServiceOrdersRepositoryInterface,
        partRepository: any,
      ) => new UpdateEstimateStatusUseCase(repository, partRepository),
      inject: [ServiceOrdersRepositoryInterface, PART_REPOSITORY],
    },
    {
      provide: GetAverageExecutionTimeUseCase,
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new GetAverageExecutionTimeUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
    },
    {
      provide: CloseServiceOrderUseCase,
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new CloseServiceOrderUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
    },
    {
      provide: DeliverVehicleUseCase,
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new DeliverVehicleUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
    },
    {
      provide: FindAllServiceOrdersUseCase,
      useFactory: (queryService: ServiceOrderQueryServiceInterface) =>
        new FindAllServiceOrdersUseCase(queryService),
      inject: [ServiceOrderQueryServiceInterface],
    },
    {
      provide: FindOneServiceOrderUseCase,
      useFactory: (queryService: ServiceOrderQueryServiceInterface) =>
        new FindOneServiceOrderUseCase(queryService),
      inject: [ServiceOrderQueryServiceInterface],
    },
    {
      provide: FindServiceOrderStatusUseCase,
      useFactory: (queryService: ServiceOrderQueryServiceInterface) =>
        new FindServiceOrderStatusUseCase(queryService),
      inject: [ServiceOrderQueryServiceInterface],
    },
    {
      provide: FinishServiceUseCase,
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new FinishServiceUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
    },
    {
      provide: StartServiceUseCase,
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new StartServiceUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
    },
    {
      provide: UpdateServiceOrderStatusUseCase,
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new UpdateServiceOrderStatusUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
    },
    {
      provide: AddEstimateItemUseCase,
      useFactory: (
        repository: ServiceOrdersRepositoryInterface,
        partRepository: any,
        serviceCatalogRepository?: any,
      ) =>
        new AddEstimateItemUseCase(
          repository,
          partRepository,
          serviceCatalogRepository,
        ),
      inject: [
        ServiceOrdersRepositoryInterface,
        PART_REPOSITORY,
        SERVICE_CATALOG_REPOSITORY,
      ],
    },
    {
      provide: RejectEstimateUseCase,
      useFactory: (
        repository: ServiceOrdersRepositoryInterface,
        partRepository: any,
      ) => new RejectEstimateUseCase(repository, partRepository),
      inject: [ServiceOrdersRepositoryInterface, PART_REPOSITORY],
    },
    {
      provide: AssignMechanicUseCase,
      useFactory: (
        repository: ServiceOrdersRepositoryInterface,
        userRepository: any,
      ) => new AssignMechanicUseCase(repository, userRepository),
      inject: [ServiceOrdersRepositoryInterface, USER_REPOSITORY],
    },
    {
      provide: UpdateMechanicAvailabilityUseCase,
      useFactory: (userRepository: any) =>
        new UpdateMechanicAvailabilityUseCase(userRepository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: CreateServiceOrderUseCase,
      useFactory: (
        repository: ServiceOrdersRepositoryInterface,
        customerManagement: CustomerManagementInterface,
        createEstimateUseCase: CreateEstimateUseCase,
        addEstimateItemUseCase: AddEstimateItemUseCase,
      ) =>
        new CreateServiceOrderUseCase(
          repository,
          customerManagement,
          createEstimateUseCase,
          addEstimateItemUseCase,
        ),
      inject: [
        ServiceOrdersRepositoryInterface,
        CustomerManagementInterface,
        CreateEstimateUseCase,
        AddEstimateItemUseCase,
      ],
    },
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
export class ServiceOrdersModule {}
