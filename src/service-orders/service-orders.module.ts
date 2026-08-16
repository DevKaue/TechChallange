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
import { CustomerManagementModule } from '@customer-management/infra/customer-management.module';
import { AccessIdentityModule } from '@access-identity/access-identity.module';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import { SERVICE_CATALOG_REPOSITORY } from '@service-orders/domain/acls/service-catalog-repository.interface';
import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';
import CustomerManagementInterface from '@common/application/contracts/customer-management.interface';
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
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { EXCEPTION_STATUS_MAP } from '@/common/infra/filters/exception-status.map';
import { serviceOrdersStatusMap } from '@/service-orders/infra/filters/service-orders-status.map';
import { createProvider } from '@/common/infra/di/create-provider';
import { ServiceCatalogInfraController } from './catalog/infra/controllers/service-catalog.controller';
import ServiceCatalogRepositoryInterface from './catalog/domain/contracts/service-catalog-repository.interface';
import { PrismaServiceCatalogRepository } from './catalog/infra/repositories/prisma-service-catalog.repository';
import { CreateServiceCatalogUseCase } from './catalog/application/usecases/create-service-catalog.use-case';
import { ListServiceCatalogUseCase } from './catalog/application/usecases/list-service-catalog.use-case';
import { FindByIdServiceCatalogUseCase } from './catalog/application/usecases/find-by-id-service-catalog.use-case';
import { UpdateServiceCatalogUseCase } from './catalog/application/usecases/update-service-catalog.use-case';
import { DeleteServiceCatalogUseCase } from './catalog/application/usecases/delete-service-catalog.use-case';
import CreateServiceCatalogController from './catalog/presentation/controllers/create-service-catalog.controller';
import ListServiceCatalogController from './catalog/presentation/controllers/list-service-catalog.controller';
import FindServiceCatalogByIdController from './catalog/presentation/controllers/find-service-catalog-by-id.controller';
import UpdateServiceCatalogController from './catalog/presentation/controllers/update-service-catalog.controller';
import DeleteServiceCatalogController from './catalog/presentation/controllers/delete-service-catalog.controller';

@Module({
  imports: [MaterialsModule, CustomerManagementModule, AccessIdentityModule],
  controllers: [
    ServiceOrderInfraController,
    EstimateInfraController,
    MechanicInfraController,
    DiagnosisInfraController,
    MetricsInfraController,
    ServiceCatalogInfraController,
  ],
  providers: [
    {
      provide: EXCEPTION_STATUS_MAP,
      useValue: serviceOrdersStatusMap,
    },
    DomainExceptionFilter,
    // ServiceOrderUseCase,
    // EstimateUseCase,
    // MechanicUseCase,
    // MetricsUseCase,
    createProvider(StartDiagnosisUseCase, [ServiceOrdersRepositoryInterface]),
    createProvider(CreateEstimateUseCase, [ServiceOrdersRepositoryInterface]),
    createProvider(UpdateEstimateStatusUseCase, [
      ServiceOrdersRepositoryInterface,
    ]),
    createProvider(GetAverageExecutionTimeUseCase, [
      ServiceOrdersRepositoryInterface,
    ]),
    createProvider(CloseServiceOrderUseCase, [
      ServiceOrdersRepositoryInterface,
    ]),
    createProvider(DeliverVehicleUseCase, [ServiceOrdersRepositoryInterface]),
    createProvider(FindAllServiceOrdersUseCase, [
      ServiceOrderQueryServiceInterface,
    ]),
    createProvider(FindOneServiceOrderUseCase, [
      ServiceOrderQueryServiceInterface,
    ]),
    createProvider(FinishServiceUseCase, [ServiceOrdersRepositoryInterface]),
    createProvider(StartServiceUseCase, [ServiceOrdersRepositoryInterface]),
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
    createProvider(RejectEstimateUseCase, [
      ServiceOrdersRepositoryInterface,
      PART_REPOSITORY,
    ]),
    createProvider(AssignMechanicUseCase, [
      ServiceOrdersRepositoryInterface,
      USER_REPOSITORY,
    ]),
    createProvider(UpdateMechanicAvailabilityUseCase, [USER_REPOSITORY]),
    createProvider(CreateServiceOrderUseCase, [
      ServiceOrdersRepositoryInterface,
      CustomerManagementInterface,
    ]),
    createProvider(StartDiagnosisController, [StartDiagnosisUseCase]),
    createProvider(CreateEstimateController, [CreateEstimateUseCase]),
    createProvider(UpdateEstimateStatusController, [
      UpdateEstimateStatusUseCase,
    ]),
    createProvider(AddEstimateItemController, [AddEstimateItemUseCase]),
    createProvider(RejectEstimateController, [RejectEstimateUseCase]),
    createProvider(AssignMechanicController, [AssignMechanicUseCase]),
    createProvider(UpdateMechanicAvailabilityController, [
      UpdateMechanicAvailabilityUseCase,
    ]),
    createProvider(GetAverageExecutionTimeController, [
      GetAverageExecutionTimeUseCase,
    ]),
    createProvider(CreateServiceOrderController, [CreateServiceOrderUseCase]),
    createProvider(FindAllServiceOrdersController, [
      FindAllServiceOrdersUseCase,
    ]),
    createProvider(FindOneServiceOrderController, [FindOneServiceOrderUseCase]),
    createProvider(StartServiceController, [StartServiceUseCase]),
    createProvider(FinishServiceController, [FinishServiceUseCase]),
    createProvider(DeliverVehicleController, [DeliverVehicleUseCase]),
    createProvider(CloseServiceOrderController, [CloseServiceOrderUseCase]),
    // Service Catalog (mesclado neste contexto)
    {
      provide: ServiceCatalogRepositoryInterface,
      useClass: PrismaServiceCatalogRepository,
    },
    createProvider(CreateServiceCatalogUseCase, [
      ServiceCatalogRepositoryInterface,
    ]),
    createProvider(ListServiceCatalogUseCase, [
      ServiceCatalogRepositoryInterface,
    ]),
    createProvider(FindByIdServiceCatalogUseCase, [
      ServiceCatalogRepositoryInterface,
    ]),
    createProvider(UpdateServiceCatalogUseCase, [
      ServiceCatalogRepositoryInterface,
    ]),
    createProvider(DeleteServiceCatalogUseCase, [
      ServiceCatalogRepositoryInterface,
    ]),
    createProvider(CreateServiceCatalogController, [
      CreateServiceCatalogUseCase,
    ]),
    createProvider(ListServiceCatalogController, [ListServiceCatalogUseCase]),
    createProvider(FindServiceCatalogByIdController, [
      FindByIdServiceCatalogUseCase,
    ]),
    createProvider(UpdateServiceCatalogController, [
      UpdateServiceCatalogUseCase,
    ]),
    createProvider(DeleteServiceCatalogController, [
      DeleteServiceCatalogUseCase,
    ]),
    // Adapta o repositório de domínio do catálogo ao contrato (ACL) usado
    // para precificar serviços no orçamento.
    {
      provide: SERVICE_CATALOG_REPOSITORY,
      useFactory: (repository: ServiceCatalogRepositoryInterface) => ({
        findById: async (id: string) => {
          const service = await repository.findById(id);
          return service ? { id: service.id, price: service.price } : null;
        },
      }),
      inject: [ServiceCatalogRepositoryInterface],
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
    // ACLs cross-context (CUSTOMER/VEHICLE/USER/PART) são providos
    // e exportados pelos módulos donos e chegam aqui via os imports acima.
  ],
  exports: [SERVICE_ORDERS_INTERFACE],
})
export class ServiceOrdersModule {}
