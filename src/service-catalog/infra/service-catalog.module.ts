import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/infra/prisma/prisma.module';
import { ServiceCatalogInfraController } from '@service-catalog/infra/controllers/service-catalog.controller';
import ServiceCatalogRepositoryInterface from '@service-catalog/domain/contracts/service-catalog-repository.interface';
import { PrismaServiceCatalogRepository } from '@service-catalog/infra/repositories/prisma-service-catalog.repository';
import { SERVICE_CATALOG_REPOSITORY } from '@service-orders/domain/acls/service-catalog-repository.interface';

import { CreateServiceCatalogUseCase } from '../application/usecases/create-service-catalog.use-case';
import { ListServiceCatalogUseCase } from '../application/usecases/list-service-catalog.use-case';
import { FindByIdServiceCatalogUseCase } from '../application/usecases/find-by-id-service-catalog.use-case';
import { UpdateServiceCatalogUseCase } from '../application/usecases/update-service-catalog.use-case';
import { DeleteServiceCatalogUseCase } from '../application/usecases/delete-service-catalog.use-case';
import CreateServiceCatalogController from '../presentation/controllers/create-service-catalog.controller';
import ListServiceCatalogController from '../presentation/controllers/list-service-catalog.controller';
import FindServiceCatalogByIdController from '../presentation/controllers/find-service-catalog-by-id.controller';
import UpdateServiceCatalogController from '../presentation/controllers/update-service-catalog.controller';
import DeleteServiceCatalogController from '../presentation/controllers/delete-service-catalog.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceCatalogInfraController],
  providers: [
    {
      provide: ServiceCatalogRepositoryInterface,
      useClass: PrismaServiceCatalogRepository,
    },
    {
      provide: CreateServiceCatalogUseCase,
      useFactory: (repository: ServiceCatalogRepositoryInterface) =>
        new CreateServiceCatalogUseCase(repository),
      inject: [ServiceCatalogRepositoryInterface],
    },
    {
      provide: ListServiceCatalogUseCase,
      useFactory: (repository: ServiceCatalogRepositoryInterface) =>
        new ListServiceCatalogUseCase(repository),
      inject: [ServiceCatalogRepositoryInterface],
    },
    {
      provide: FindByIdServiceCatalogUseCase,
      useFactory: (repository: ServiceCatalogRepositoryInterface) =>
        new FindByIdServiceCatalogUseCase(repository),
      inject: [ServiceCatalogRepositoryInterface],
    },
    {
      provide: UpdateServiceCatalogUseCase,
      useFactory: (repository: ServiceCatalogRepositoryInterface) =>
        new UpdateServiceCatalogUseCase(repository),
      inject: [ServiceCatalogRepositoryInterface],
    },
    {
      provide: DeleteServiceCatalogUseCase,
      useFactory: (repository: ServiceCatalogRepositoryInterface) =>
        new DeleteServiceCatalogUseCase(repository),
      inject: [ServiceCatalogRepositoryInterface],
    },
    {
      provide: CreateServiceCatalogController,
      useFactory: (useCase: CreateServiceCatalogUseCase) =>
        new CreateServiceCatalogController(useCase),
      inject: [CreateServiceCatalogUseCase],
    },
    {
      provide: ListServiceCatalogController,
      useFactory: (useCase: ListServiceCatalogUseCase) =>
        new ListServiceCatalogController(useCase),
      inject: [ListServiceCatalogUseCase],
    },
    {
      provide: FindServiceCatalogByIdController,
      useFactory: (useCase: FindByIdServiceCatalogUseCase) =>
        new FindServiceCatalogByIdController(useCase),
      inject: [FindByIdServiceCatalogUseCase],
    },
    {
      provide: UpdateServiceCatalogController,
      useFactory: (useCase: UpdateServiceCatalogUseCase) =>
        new UpdateServiceCatalogController(useCase),
      inject: [UpdateServiceCatalogUseCase],
    },
    {
      provide: DeleteServiceCatalogController,
      useFactory: (useCase: DeleteServiceCatalogUseCase) =>
        new DeleteServiceCatalogController(useCase),
      inject: [DeleteServiceCatalogUseCase],
    },
    // Adapta o repositório de domínio ao contrato (ACL) que service-orders
    // espera para precificar serviços no orçamento.
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
  ],
  exports: [SERVICE_CATALOG_REPOSITORY],
})
export class ServiceCatalogModule {}
