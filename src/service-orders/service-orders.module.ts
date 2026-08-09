import { Module } from '@nestjs/common';
import { ServiceOrderInfraController } from './infra/controllers/service-order.controller';
import { EstimateInfraController } from './infra/controllers/estimate.controller';
import { MechanicInfraController } from './infra/controllers/mechanic.controller';
import { DiagnosisInfraController } from './infra/controllers/diagnosis.controller';
import { MetricsInfraController } from './infra/controllers/metrics.controller';
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
import StartDiagnosisController from './presentation/controllers/start-diagnosis.controller';
import CreateEstimateController from './presentation/controllers/create-estimate.controller';
import UpdateEstimateStatusController from './presentation/controllers/update-estimate-status.controller';
import AddEstimateItemController from './presentation/controllers/add-estimate-item.controller';
import RejectEstimateController from './presentation/controllers/reject-estimate.controller';
import AssignMechanicController from './presentation/controllers/assign-mechanic.controller';
import UpdateMechanicAvailabilityController from './presentation/controllers/update-mechanic-availability.controller';
import GetAverageExecutionTimeController from './presentation/controllers/get-average-execution-time.controller';
import CreateServiceOrderController from './presentation/controllers/create-service-order.controller';
import FindAllServiceOrdersController from './presentation/controllers/find-all-service-orders.controller';
import FindOneServiceOrderController from './presentation/controllers/find-one-service-order.controller';
import StartServiceController from './presentation/controllers/start-service.controller';
import FinishServiceController from './presentation/controllers/finish-service.controller';
import DeliverVehicleController from './presentation/controllers/deliver-vehicle.controller';
import CloseServiceOrderController from './presentation/controllers/close-service-order.controller';

@Module({
  imports: [
    MaterialsModule,
    ServiceCatalogModule,
    CustomerManagementModule,
    AccessIdentityModule,
  ],
  controllers: [
    ServiceOrderInfraController,
    EstimateInfraController,
    MechanicInfraController,
    DiagnosisInfraController,
    MetricsInfraController,
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
      useFactory: (repository: ServiceOrdersRepositoryInterface) =>
        new UpdateEstimateStatusUseCase(repository),
      inject: [ServiceOrdersRepositoryInterface],
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
      ) => new CreateServiceOrderUseCase(repository, customerManagement),
      inject: [ServiceOrdersRepositoryInterface, CustomerManagementInterface],
    },
    {
      provide: StartDiagnosisController,
      useFactory: (useCase: StartDiagnosisUseCase) =>
        new StartDiagnosisController(useCase),
      inject: [StartDiagnosisUseCase],
    },
    {
      provide: CreateEstimateController,
      useFactory: (useCase: CreateEstimateUseCase) =>
        new CreateEstimateController(useCase),
      inject: [CreateEstimateUseCase],
    },
    {
      provide: UpdateEstimateStatusController,
      useFactory: (useCase: UpdateEstimateStatusUseCase) =>
        new UpdateEstimateStatusController(useCase),
      inject: [UpdateEstimateStatusUseCase],
    },
    {
      provide: AddEstimateItemController,
      useFactory: (useCase: AddEstimateItemUseCase) =>
        new AddEstimateItemController(useCase),
      inject: [AddEstimateItemUseCase],
    },
    {
      provide: RejectEstimateController,
      useFactory: (useCase: RejectEstimateUseCase) =>
        new RejectEstimateController(useCase),
      inject: [RejectEstimateUseCase],
    },
    {
      provide: AssignMechanicController,
      useFactory: (useCase: AssignMechanicUseCase) =>
        new AssignMechanicController(useCase),
      inject: [AssignMechanicUseCase],
    },
    {
      provide: UpdateMechanicAvailabilityController,
      useFactory: (useCase: UpdateMechanicAvailabilityUseCase) =>
        new UpdateMechanicAvailabilityController(useCase),
      inject: [UpdateMechanicAvailabilityUseCase],
    },
    {
      provide: GetAverageExecutionTimeController,
      useFactory: (useCase: GetAverageExecutionTimeUseCase) =>
        new GetAverageExecutionTimeController(useCase),
      inject: [GetAverageExecutionTimeUseCase],
    },
    {
      provide: CreateServiceOrderController,
      useFactory: (useCase: CreateServiceOrderUseCase) =>
        new CreateServiceOrderController(useCase),
      inject: [CreateServiceOrderUseCase],
    },
    {
      provide: FindAllServiceOrdersController,
      useFactory: (useCase: FindAllServiceOrdersUseCase) =>
        new FindAllServiceOrdersController(useCase),
      inject: [FindAllServiceOrdersUseCase],
    },
    {
      provide: FindOneServiceOrderController,
      useFactory: (useCase: FindOneServiceOrderUseCase) =>
        new FindOneServiceOrderController(useCase),
      inject: [FindOneServiceOrderUseCase],
    },
    {
      provide: StartServiceController,
      useFactory: (useCase: StartServiceUseCase) =>
        new StartServiceController(useCase),
      inject: [StartServiceUseCase],
    },
    {
      provide: FinishServiceController,
      useFactory: (useCase: FinishServiceUseCase) =>
        new FinishServiceController(useCase),
      inject: [FinishServiceUseCase],
    },
    {
      provide: DeliverVehicleController,
      useFactory: (useCase: DeliverVehicleUseCase) =>
        new DeliverVehicleController(useCase),
      inject: [DeliverVehicleUseCase],
    },
    {
      provide: CloseServiceOrderController,
      useFactory: (useCase: CloseServiceOrderUseCase) =>
        new CloseServiceOrderController(useCase),
      inject: [CloseServiceOrderUseCase],
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