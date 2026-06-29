import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import AddMaterialStockUseCase from '@materials/application/usecases/add-material-stock.usecase';
import CreateMaterialUseCase from '@materials/application/usecases/create-material.usecase';
import DeleteMaterialUseCase from '@materials/application/usecases/delete-material.usecase';
import FindMaterialByIdUseCase from '@materials/application/usecases/find-material-by-id.usecase';
import ListMaterialsUseCase from '@materials/application/usecases/list-materials.usecase';
import UpdateMaterialUseCase from '@materials/application/usecases/update-material.usecase';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';
import PrismaMaterialRepository from '@materials/infra/repositories/prisma-material.repository';
import { MaterialsController } from '@materials/presentation/controllers/materials.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialsController],
  providers: [
    {
      provide: MaterialRepositoryInterface,
      useClass: PrismaMaterialRepository,
    },
    {
      provide: PART_REPOSITORY,
      useExisting: MaterialRepositoryInterface,
    },
    {
      provide: CreateMaterialUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new CreateMaterialUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: ListMaterialsUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new ListMaterialsUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: FindMaterialByIdUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new FindMaterialByIdUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: UpdateMaterialUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new UpdateMaterialUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: AddMaterialStockUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new AddMaterialStockUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
    {
      provide: DeleteMaterialUseCase,
      useFactory: (repository: MaterialRepositoryInterface) =>
        new DeleteMaterialUseCase(repository),
      inject: [MaterialRepositoryInterface],
    },
  ],
  exports: [PART_REPOSITORY, MaterialRepositoryInterface],
})
export class MaterialsModule {}
