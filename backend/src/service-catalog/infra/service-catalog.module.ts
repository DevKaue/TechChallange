import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ServiceCatalogController } from '@service-catalog/presentation/controllers/service-catalog.controller';
import { ServiceCatalogUseCase } from '@service-catalog/application/usecases/service-catalog.use-case';
import ServiceCatalogRepositoryInterface from '@service-catalog/domain/contracts/service-catalog-repository.interface';
import { PrismaServiceCatalogRepository } from '@service-catalog/infra/repositories/prisma-service-catalog.repository';
import { SERVICE_CATALOG_REPOSITORY } from '@service-orders/domain/acls/service-catalog-repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceCatalogController],
  providers: [
    {
      provide: ServiceCatalogRepositoryInterface,
      useClass: PrismaServiceCatalogRepository,
    },
    {
      provide: ServiceCatalogUseCase,
      useFactory: (repository: ServiceCatalogRepositoryInterface) =>
        new ServiceCatalogUseCase(repository),
      inject: [ServiceCatalogRepositoryInterface],
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
