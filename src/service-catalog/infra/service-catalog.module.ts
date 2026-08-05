import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ServiceCatalogController } from '@service-catalog/presentation/controllers/service-catalog.controller';
import ServiceCatalogRepositoryInterface from '@service-catalog/domain/contracts/service-catalog-repository.interface';
import { PrismaServiceCatalogRepository } from '@service-catalog/infra/repositories/prisma-service-catalog.repository';
import { SERVICE_CATALOG_REPOSITORY } from '@service-orders/domain/acls/service-catalog-repository.interface';

import { CreateServiceCatalogUseCase } from '../application/usecases/create-service-catalog.use-case';
import { ListServiceCatalogUseCase } from '../application/usecases/list-service-catalog.use-case';
import { FindByIdServiceCatalogUseCase } from '../application/usecases/find-by-id-service-catalog.use-case';
import { UpdateServiceCatalogUseCase } from '../application/usecases/update-service-catalog.use-case';
import { DeleteServiceCatalogUseCase } from '../application/usecases/delete-service-catalog.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceCatalogController],
  providers: [
    {
      provide: ServiceCatalogRepositoryInterface,
      useClass: PrismaServiceCatalogRepository,
    },
    CreateServiceCatalogUseCase,
    ListServiceCatalogUseCase,
    FindByIdServiceCatalogUseCase,
    UpdateServiceCatalogUseCase,
    DeleteServiceCatalogUseCase,
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
